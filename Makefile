# Define your Flask app and React app entry point
FLASK_APP = server.py
REACT_APP_DIR = src
NPM_CMD = npm install

# Install Python dependencies
install:
	@echo "Installing Python dependencies..."
	pip install flask flask-cors numpy matplotlib

# Install npm dependencies
npm-install:
	@echo "Installing npm dependencies..."
	cd $(REACT_APP_DIR) && $(NPM_CMD)

# Run the Flask application
run:
	FLASK_APP=$(FLASK_APP) FLASK_ENV=development flask run --port 5000

# Run the React application
run-react:
	cd $(REACT_APP_DIR) && npm run dev

# Clean up Python dependencies (virtual environment not used)
clean:
	@echo "No virtual environment to clean."

# Reinstall all dependencies
reinstall: clean install npm-install
