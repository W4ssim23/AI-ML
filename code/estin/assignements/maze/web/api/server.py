from flask import Flask, request, jsonify
from agents import generate_maze, bfs_agent, dfs_agent, a_star_agent, manhattan_distance_heuristic
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad Request", "message": str(error)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not Found", "message": str(error)}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"error": "Internal Server Error", "message": str(error)}), 500


@app.route('/')
def index():
    return jsonify({
        "message": "Welcome to the Maze API",
        "endpoints": {
            "/maze": {
                "method": "POST",
                "description": "Generate a random maze"
            },
            "/solve": {
                "method": "POST",
                "description": "Solve a maze"
            }
        }
    })


@app.route('/maze', methods=['POST'])
def maze():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        width = data.get('width', 15)
        height = data.get('height', 15)
        start = data.get('start', (0, 0))

        if not isinstance(width, int) or not isinstance(height, int) or width <= 0 or height <= 0:
            raise ValueError("Width and height must be positive integers")
        if not isinstance(start, (list, tuple)) or len(start) != 2 or not all(isinstance(x, int) for x in start):
            raise ValueError("Start must be a tuple or list of two integers")
        if start[0] < 0 or start[0] >= height or start[1] < 0 or start[1] >= width:
            raise ValueError("Start position is out of bounds")

        maze , time = generate_maze(height, width, start)

        return jsonify({
            "maze": maze,
            "start": start,
            "width": width,
            "height": height,
            "time": time
        })

    except Exception as e:
        return jsonify({"error": "Maze generation failed", "message": str(e)}), 400


@app.route('/solve', methods=['POST'])
def solve():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        maze = data.get('maze')
        start = data.get('start')
        end = data.get('end')
        algorithm = data.get('algorithm', 'bfs').lower()
        with_steps = data.get('with_steps', False)

        if not maze or not start or not end:
            raise ValueError("Maze, start, and end are required")
        if not isinstance(start, (list, tuple)) or len(start) != 2 or not all(isinstance(x, int) for x in start):
            raise ValueError("Start must be a tuple or list of two integers")
        if not isinstance(end, (list, tuple)) or len(end) != 2 or not all(isinstance(x, int) for x in end):
            raise ValueError("End must be a tuple or list of two integers")
        if algorithm not in ['bfs', 'dfs', 'astar']:
            raise ValueError("Algorithm must be one of 'bfs', 'dfs', or 'astar'")
        if not isinstance(with_steps, bool):
            raise ValueError("with_steps must be a boolean")

        if algorithm == 'bfs':
            result = bfs_agent(maze, tuple(start), tuple(end), with_steps)
        elif algorithm == 'dfs':
            result = dfs_agent(maze, tuple(start), tuple(end), with_steps)
        elif algorithm == 'astar':
            result = a_star_agent(maze, tuple(start), tuple(end), manhattan_distance_heuristic, with_steps)

        if not result:
            return jsonify({"error": "No path found"}), 404

        response = {
            "path": result["path"],
            "time": result["time"],
            "visited": list(result["visited"]),
            "algorithm": algorithm,
            "start": start,
            "end": end
        }
        if with_steps:
            response["steps"] = result["steps"]
        
        return jsonify(response)

    except Exception as e:
        return jsonify({"error": "Maze solving failed", "message": str(e)}), 400


@app.route('/race', methods=['POST'])
def race():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No JSON data provided")

        maze = data.get('maze')
        start = data.get('start')
        end = data.get('end')
        agent_1 = data.get('algorithm', 'dfs').lower()
        agent_2 = data.get('algorithm', 'astar').lower()

        if not maze or not start or not end:
            raise ValueError("Maze, start, and end are required")
        if not isinstance(start, (list, tuple)) or len(start) != 2 or not all(isinstance(x, int) for x in start):
            raise ValueError("Start must be a tuple or list of two integers")
        if not isinstance(end, (list, tuple)) or len(end) != 2 or not all(isinstance(x, int) for x in end):
            raise ValueError("End must be a tuple or list of two integers")
        if agent_1 not in ['bfs', 'dfs', 'astar']:
            raise ValueError("Algorithm must be one of 'bfs', 'dfs', or 'astar'")
        if agent_2 not in ['bfs', 'dfs', 'astar']:
            raise ValueError("Algorithm must be one of 'bfs', 'dfs', or 'astar'")

        if agent_1 == 'bfs':
            result_1 = bfs_agent(maze, tuple(start), tuple(end), True)
        elif agent_1 == 'dfs':
            result_1 = dfs_agent(maze, tuple(start), tuple(end), True)
        elif agent_1 == 'astar':
            result_1 = a_star_agent(maze, tuple(start), tuple(end), manhattan_distance_heuristic, True)

        if agent_2 == 'bfs':
            result_2 = bfs_agent(maze, tuple(start), tuple(end), True)
        elif agent_2 == 'dfs':
            result_2 = dfs_agent(maze, tuple(start), tuple(end), True)
        elif agent_2 == 'astar':
            result_2 = a_star_agent(maze, tuple(start), tuple(end), manhattan_distance_heuristic, True)

        if not result_1 or not result_2:
            return jsonify({"error": "No path found"}), 404

        response_1 = {
            "path": result_1["path"],
            "time": result_1["time"],
            "visited": list(result_1["visited"]),
            "steps": result_1["steps"],
            "algorithm": agent_1,
        }

        response_2 = {
            "path": result_2["path"],
            "time": result_2["time"],
            "visited": list(result_2["visited"]),
            "steps": result_2["steps"],
            "algorithm": agent_2,
        }
        
        return jsonify({
            "agent_1": response_1,
            "agent_2": response_2,
            "start": start,
            "end": end
        })

    except Exception as e:
        return jsonify({"error": "Maze solving failed", "message": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)