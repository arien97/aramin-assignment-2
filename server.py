from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use the Agg backend
import matplotlib.pyplot as plt
import io
import base64

app = Flask(__name__)
CORS(app)  # Enable CORS

# Global variables
points = None
selected_centers = None
point_colors = None

# Function to generate random data points
def generate_random_points(num_points=200):
    return np.random.uniform(-10, 10, (num_points, 2))

# Function to generate random centers
def generate_centers_random(k):
    return np.random.uniform(low=-10, high=10, size=(k, 2))

# Function to generate centers using farthest first method
def generate_centers_farthest_first(k, points):
    centers = [points[np.random.choice(points.shape[0])]]
    for _ in range(1, k):
        distances = np.min(np.linalg.norm(points[:, np.newaxis] - np.array(centers), axis=2), axis=1)
        next_center = points[np.argmax(distances)]
        centers.append(next_center)
    return np.array(centers)

# Function to generate centers using KMeans++ method
def generate_centers_kmeans_plus_plus(k, points):
    centers = [points[np.random.choice(points.shape[0])]]
    for _ in range(1, k):
        distances = np.min(np.linalg.norm(points[:, np.newaxis] - np.array(centers), axis=2), axis=1)
        probabilities = distances / distances.sum()
        next_center = points[np.random.choice(points.shape[0], p=probabilities)]
        centers.append(next_center)
    return np.array(centers)

# Function to assign colors to centers and points
def assign_colors(centers, points):
    colors = ['red', 'orange', 'pink', 'blue', 'green', 'purple', 'brown', 'cyan', 'magenta', 'yellow']
    point_colors = []
    for point in points:
        distances = np.linalg.norm(centers - point, axis=1)
        closest_center = np.argmin(distances)
        point_colors.append(colors[closest_center % len(colors)])
    return point_colors

# Function to recalculate centers based on clusters
def recalculate_centers(centers, points, point_colors):
    new_centers = []
    colors = ['red', 'orange', 'pink', 'blue', 'green', 'purple', 'brown', 'cyan', 'magenta', 'yellow']
    
    for i in range(len(centers)):
        cluster_points = points[np.array(point_colors) == colors[i % len(colors)]]
        if len(cluster_points) > 0:
            new_center = cluster_points.mean(axis=0)
            new_centers.append(new_center)
        else:
            new_centers.append(centers[i])
    
    return np.array(new_centers)

# Function to plot the graph and return it as a base64 string
def plot_graph(centers, points, point_colors):
    fig, ax = plt.subplots()
    ax.set_xlim(-10, 10)
    ax.set_ylim(-10, 10)
    ax.set_xlabel('X-axis')
    ax.set_ylabel('Y-axis')
    ax.set_title('K-Means Clustering')
    ax.scatter(points[:, 0], points[:, 1], c=point_colors, s=20)
    if len(centers) > 0:
        ax.scatter(centers[:, 0], centers[:, 1], c='red', marker='x', s=100)
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_base64

@app.route('/generate_dataset', methods=['POST'])
def generate_dataset():
    global points, point_colors
    points = generate_random_points()
    point_colors = ['blue'] * len(points)
    img_base64 = plot_graph([], points, point_colors)
    return jsonify({'image': img_base64})

@app.route('/initialize_centers', methods=['POST'])
def initialize_centers():
    global selected_centers, points, point_colors
    data = request.json
    k = int(data['k'])  # Convert k to an integer
    method = data['method']
    
    if method == "Random":
        selected_centers = generate_centers_random(k)
    elif method == "Farthest First":
        selected_centers = generate_centers_farthest_first(k, points)
    elif method == "KMeans++":
        selected_centers = generate_centers_kmeans_plus_plus(k, points)
    
    print(f"Initialized centers (k={k}, method={method}): {selected_centers}")
    point_colors = assign_colors(selected_centers, points)
    img_base64 = plot_graph(selected_centers, points, point_colors)
    return jsonify({'image': img_base64})

@app.route('/initialize_centers_manual', methods=['POST'])
def initialize_centers_manual():
    global selected_centers, points, point_colors
    data = request.json
    centers = data['centers']
    selected_centers = np.array([[center['x'], center['y']] for center in centers])
    print(f"Manually initialized centers: {selected_centers}")
    point_colors = assign_colors(selected_centers, points)
    img_base64 = plot_graph(selected_centers, points, point_colors)
    return jsonify({'image': img_base64})

@app.route('/update_plot_with_center', methods=['POST'])
def update_plot_with_center():
    global points, point_colors
    data = request.json
    centers = data['centers']
    centers_array = np.array([[center['x'], center['y']] for center in centers])
    point_colors = assign_colors(centers_array, points)
    img_base64 = plot_graph(centers_array, points, point_colors)
    return jsonify({'image': img_base64})


@app.route('/step_kmeans', methods=['POST'])
def step_kmeans():
    global selected_centers, points, point_colors
    print(f"Step KMeans - selected_centers: {selected_centers}, points: {points}, point_colors: {point_colors}")
    if selected_centers is not None and points is not None and point_colors is not None:
        new_centers = recalculate_centers(selected_centers, points, point_colors)
        
        if np.array_equal(new_centers, selected_centers):
            return jsonify({'message': "KMeans has converged!"})
        
        selected_centers = new_centers
        point_colors = assign_colors(selected_centers, points)
        img_base64 = plot_graph(selected_centers, points, point_colors)
        return jsonify({'image': img_base64})
    return jsonify({'error': 'Initialization required'})

@app.route('/run_to_convergence', methods=['POST'])
def run_to_convergence():
    global selected_centers, points, point_colors
    if selected_centers is not None and points is not None and point_colors is not None:
        while True:
            new_centers = recalculate_centers(selected_centers, points, point_colors)
            
            if np.array_equal(new_centers, selected_centers):
                img_base64 = plot_graph(selected_centers, points, point_colors)
                return jsonify({'image': img_base64, 'message': "KMeans has converged!"})
            
            selected_centers = new_centers
            point_colors = assign_colors(selected_centers, points)
        
    return jsonify({'error': 'Initialization required'})

@app.route('/reset_algorithm', methods=['POST'])
def reset_algorithm():
    global selected_centers, point_colors
    selected_centers = None
    point_colors = ['blue'] * len(points)
    img_base64 = plot_graph([], points, point_colors)
    return jsonify({'image': img_base64})

if __name__ == '__main__':
    points = generate_random_points()
    app.run(debug=True, port=5000)
