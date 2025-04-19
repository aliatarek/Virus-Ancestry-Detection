from Bio import SeqIO
from Bio.Align import PairwiseAligner
import os
from fpdf import FPDF
from collections import defaultdict
import io
import threading
from concurrent.futures import ThreadPoolExecutor

def process_base64(fasta_content, directory, threshold=11, dynamic_threshold_factor=1.5):
    """
    Decode a Base64-encoded FASTA file and find the closest DNA matches in the directory.
    """
    try:
        # Parse the FASTA content to extract the target DNA
        target_dna = None
        fasta_io = io.StringIO(fasta_content)  # Wrap the string in a StringIO object
        for record in SeqIO.parse(fasta_io, "fasta"):  # Pass the StringIO object to SeqIO.parse
            target_dna = str(record.seq).upper()
            break  # Assume the first sequence is the target

        if target_dna is None:
            raise ValueError("No valid DNA sequence found in the provided FASTA content.")

        # Load the database sequences from the directory
        _, database, families = load_fasta_sequences(directory)
        print("Loaded Database Keys:", list(database.keys()))  # Debug

        if not database:
            return {"error": "No DNA sequences found in the database."}

        # Find the closest matches using threading
        matches, bestFamily = find_closest_ancestors_with_threading(
            target_dna, database, families, threshold, dynamic_threshold_factor
        )

        if not matches:
            return {"error": "No matches found above the threshold."}

        # Generate a PDF report for the best match
        generate_pdf_report(
            matches[0]['name'],
            matches[0]['score'],
            (matches[0]['aligned_target'], matches[0]['aligned_dna']),
            families,
            bestFamily
        )

        return {"matches": matches}

    except Exception as e:
        print("Error in process_base64:", e)  # Debug
        return {"error": str(e)}


def load_fasta_sequences(directory):
    """
    Load DNA sequences from all .fasta files in the directory.
    """
    database = {}

    for file in os.listdir(directory):
        if file.endswith(".fasta"):
            filepath = os.path.join(directory, file)
            for record in SeqIO.parse(filepath, "fasta"):
                seq = str(record.seq).upper()
                if len(seq) < 100:  # Filter out very short sequences
                    continue
                database[record.id] = seq  # Use full sequence
    
    family=cluster_viruses(database)
    return None, database,family


def align_using_biopython(seq1, seq2):
    """
    Perform alignment using BioPython's PairwiseAligner with enhancements for logical outputs.
    """
    aligner = PairwiseAligner()
    aligner.mode = 'local'  # Use local alignment to find the best matching region
    aligner.match_score = 2
    aligner.mismatch_score = -2
    aligner.open_gap_score = -5
    aligner.extend_gap_score = -1

    # Perform the alignment
    alignments = aligner.align(seq1, seq2)
    best_alignment = alignments[0]  # Get the best alignment

    score = best_alignment.score
    aligned_seq1 = str(best_alignment[0])  # Extract the aligned version of seq1
    aligned_seq2 = str(best_alignment[1])  # Extract the aligned version of seq2

    # Normalize score by alignment length
    alignment_length = max(len(aligned_seq1.replace("-", "")), len(aligned_seq2.replace("-", "")))
    normalized_score = score / alignment_length if alignment_length > 0 else 0

    return normalized_score, aligned_seq1, aligned_seq2


def divide_and_conquer_dna_match(seq1, seq2, min_length=1800):
    """
    Recursively aligns two DNA sequences using divide and conquer with BioPython's PairwiseAligner.
    """
    if len(seq1) <= min_length or len(seq2) <= min_length:
        return align_using_biopython(seq1, seq2)

    mid1 = len(seq1) // 2
    mid2 = len(seq2) // 2

    # Divide: Align left and right halves sequentially
    left_score, left_seq1, left_seq2 = divide_and_conquer_dna_match(seq1[:mid1], seq2[:mid2], min_length)
    right_score, right_seq1, right_seq2 = divide_and_conquer_dna_match(seq1[mid1:], seq2[mid2:], min_length)

    # Combine results
    total_score = left_score + right_score
    combined_seq1 = left_seq1 + right_seq1
    combined_seq2 = left_seq2 + right_seq2

    return total_score, combined_seq1, combined_seq2


def find_closest_ancestors_with_threading(target_dna, database, family_info, threshold=10, dynamic_threshold_factor=1.5):
    """
    Compare the target DNA to a database and find matches above the threshold using threading.
    """
    matches = []
    max_threads = 6  # Limit to a maximum of 6 threads

    def compute_match(name, dna):
        score, aligned_target, aligned_dna = divide_and_conquer_dna_match(target_dna, dna)
        if score >= threshold:  # Only include matches above the threshold
            matches.append({
                "name": name,
                "score": round(score, 2),
                "aligned_target": aligned_target[:100] + "...",  # Show a preview of the alignment
                "aligned_dna": aligned_dna[:100] + "..."  # Show a preview of the alignment
            })

    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        # Submit jobs to the thread pool
        for name, dna in database.items():
            executor.submit(compute_match, name, dna)

        # Wait for all threads to complete
        executor.shutdown(wait=True)

    # Sort matches in descending order of score
    matches.sort(key=lambda x: x["score"], reverse=True)

    reversed_family_info = {
        virus.lower(): family for family, viruses in family_info.items() for virus in viruses
    }
    best_family = reversed_family_info.get(matches[0]["name"].lower(), None) if matches else None

    return matches, best_family


def generate_pdf_report(best_match, best_score, best_alignment, families, closest_family, output_path="virus_report.pdf"):
    """
    Generate a PDF report for the virus family detection results.

    Args:
        target_file (str): Name of the target virus file.
        best_match (str): Closest individual match.
        best_score (int): Similarity score for the closest match.
        best_alignment (tuple): Alignment details (aligned target, aligned match).
        families (dict): Clustered virus families.
        closest_family (str): Closest family name.
        family_match (str): Closest match within the family.
        family_score (int): Family-level similarity score.
        output_path (str): Path to save the generated PDF file.
    """
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Add Title
    pdf.set_font("Arial", size=16, style="B")
    pdf.cell(200, 10, txt="Virus Family Detection Report", ln=True, align="C")
    pdf.ln(10)

    # # Add Metadata
    # pdf.set_font("Arial", size=12)
    # pdf.cell(200, 10, txt=f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    # pdf.cell(200, 10, txt=f"Target Virus File: {target_file}", ln=True)
    # pdf.ln(10)

    # Closest Match
    pdf.set_font("Arial", size=14, style="B")
    pdf.cell(200, 10, txt="Closest Match:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Closest Virus: {best_match}", ln=True)
    pdf.cell(200, 10, txt=f"Score: {best_score}", ln=True)
    pdf.ln(5)

    # Add alignment details (partial for clarity)
    if best_alignment:
        aligned_target, aligned_match = best_alignment
        pdf.cell(200, 10, txt="Alignment (Partial):", ln=True)
        pdf.set_font("Courier", size=10)
        pdf.multi_cell(0, 5, txt=f"Target: {aligned_target[:100]}...")
        pdf.multi_cell(0, 5, txt=f"Match:  {aligned_match[:100]}...")
        pdf.ln(5)

    # Virus Families
    pdf.set_font("Arial", size=14, style="B")
    pdf.cell(200, 10, txt="Virus Families:", ln=True)
    pdf.set_font("Arial", size=12)
    for family, members in families.items():
        pdf.cell(200, 10, txt=f"{family}: {', '.join(members)}", ln=True)
    pdf.ln(10)

    # Closest Family
    pdf.set_font("Arial", size=14, style="B")
    pdf.cell(200, 10, txt="Closest Family:", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt=f"Family Name: {closest_family}", ln=True)

    # Save PDF
    pdf.output(output_path)
    print(f"Report saved as {output_path}")



def cluster_viruses(database, threshold=10):
    family_dict = {}
    family_counter = 1
    families = defaultdict(list)

    # Convert virus names to a list for efficient iteration
    virus_names = list(database.keys())

    for i, name1 in enumerate(virus_names):
        seq1 = database[name1]
        if name1 not in family_dict:
            # Start a new family for the current virus
            family_name = f"Family_{family_counter}"
            family_dict[name1] = family_name
            families[family_name].append(name1)
            family_counter += 1

        for j in range(i + 1, len(virus_names)):  # Only compare each pair once
            name2 = virus_names[j]
            seq2 = database[name2]
            if name2 not in family_dict:
                # Calculate similarity score
                score, _, _ = divide_and_conquer_dna_match(seq1, seq2)
                if score >= threshold:
                    # Assign to the same family as name1
                    family_name = family_dict[name1]
                    family_dict[name2] = family_name
                    families[family_name].append(name2)

    return families