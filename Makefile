# Define your Flask app
FLASK_APP = server.py

# Install Python dependencies
install-python:
	pip install flask flask-cors numpy matplotlib

# Install npm dependencies
install-npm:
	npm install

# Install all dependencies
install: install-python install-npm

# Run the Flask application
run:
	FLASK_APP=$(FLASK_APP) FLASK_ENV=development flask run --port 5000
	npm run dev

# Clean up npm dependencies
clean:
	rm -rf node_modules
	rm -f package-lock.json

# Reinstall all dependencies
reinstall: clean install
