from flask import Flask, jsonify, request,send_file
from flask_cors import CORS
import base64
from helpers import process_base64

app = Flask(__name__)
CORS(app)

@app.route('/detect_ancestors', methods=['POST'])
def detectAncestors():
    try:
        # Parse incoming JSON data
        data = request.get_json()
        if not data or 'fastaFile' not in data:
            return jsonify({"success": False, "message": "Missing 'fastaFile' in request"}), 400

        # Decode the Base64 FASTA file
        fasta_base64 = data.get('fastaFile')
        fasta_decoded = base64.b64decode(fasta_base64).decode('utf-8')  # Decode to a UTF-8 string

        # Process the FASTA content
        result = process_base64(fasta_decoded, 'viruses')

        if "error" in result:
            return jsonify({"success": False, "message": result["error"]}), 500

        return jsonify({"success": True, "matches": result["matches"]}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()  # Print the full traceback
        print("Error:", e)  # Debug
        return jsonify({"success": False, "message": "Internal server error"}), 500

@app.route('/generate_pdf_report', methods=['GET'])
def generate_report():
    try:
        pdf_path = 'virus_report.pdf'  # Path to your PDF file
        return send_file(pdf_path, mimetype='application/pdf', as_attachment=True, download_name='downloaded_sample.pdf')
    except Exception as e:
        import traceback
        traceback.print_exc()  # Print the full traceback
        print("Error:", e)  # Debug
        return jsonify({"success": False, "message": "Internal server error"}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=8080)
