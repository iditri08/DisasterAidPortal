from flask import Flask, jsonify, request, send_from_directory
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configuration
app.config['JSON_SORT_KEYS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'json'}

# Load disaster data from JSON file
def load_disaster_data():
    try:
        with open('disaster_data.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "disasters": [],
            "prone_areas": [],
            "resources": [],
            "metadata": {
                "last_updated": "2023-01-01T00:00:00Z",
                "data_sources": [],
                "version": "1.0.0"
            }
        }

# Save disaster data to JSON file
def save_disaster_data(data):
    with open('disaster_data.json', 'w') as f:
        json.dump(data, f, indent=4)

# API Endpoints
@app.route('/api/disasters', methods=['GET'])
def get_disasters():
    data = load_disaster_data()
    return jsonify(data['disasters'])

@app.route('/api/disasters', methods=['POST'])
def add_disaster():
    data = load_disaster_data()
    new_disaster = request.get_json()
    
    # Validate required fields
    required_fields = ['type', 'location', 'description', 'severity']
    if not all(field in new_disaster for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Generate ID
    new_id = max([d.get('id', 0) for d in data['disasters']] or [0]) + 1
    new_disaster['id'] = new_id
    new_disaster['date'] = new_disaster.get('date') or datetime.utcnow().isoformat() + 'Z'
    
    data['disasters'].append(new_disaster)
    save_disaster_data(data)
    return jsonify(new_disaster), 201

@app.route('/api/prone-areas', methods=['GET'])
def get_prone_areas():
    data = load_disaster_data()
    return jsonify(data['prone_areas'])

@app.route('/api/prone-areas/<string:area_type>', methods=['GET'])
def get_prone_areas_by_type(area_type):
    data = load_disaster_data()
    filtered_areas = [area for area in data['prone_areas'] if area['type'].lower() == area_type.lower()]
    return jsonify(filtered_areas)

@app.route('/api/resources', methods=['GET'])
def get_resources():
    data = load_disaster_data()
    return jsonify(data['resources'])

@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    data = load_disaster_data()
    return jsonify(data['metadata'])

# Serve static files
@app.route('/')
def index():
    return send_from_directory('templates', 'template.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Data import/export endpoints
@app.route('/api/import-data', methods=['POST'])
def import_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            with open(filepath, 'r') as f:
                new_data = json.load(f)
                save_disaster_data(new_data)
            return jsonify({'message': 'Data imported successfully'}), 200
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid JSON file'}), 400
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/export-data', methods=['GET'])
def export_data():
    return send_from_directory('.', 'disaster_data.json', as_attachment=True)

if __name__ == '__main__':
    # Create upload directory if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Ensure the data file exists
    if not os.path.exists('disaster_data.json'):
        save_disaster_data({
            "disasters": [],
            "prone_areas": [],
            "resources": [],
            "metadata": {
                "last_updated": datetime.utcnow().isoformat() + 'Z',
                "data_sources": ["NDMA", "IMD"],
                "version": "1.0.0"
            }
        })
    
    app.run(debug=True, port=5000)