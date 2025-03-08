import osmnx as ox
import networkx as nx
import matplotlib.pyplot as plt

file_path = r"C:\Users\LENOVO\Desktop\The\data\map.osm"  
graph = ox.graph_from_xml(file_path)


fig, ax = ox.plot_graph(graph, show=False, close=False, node_size=0)

selected_points = []

def onclick(event):
    if event.inaxes == ax:
        x, y = event.xdata, event.ydata
        selected_points.append((y, x)) 
        print(f"Selected point: ({y}, {x})")
        
        ax.scatter(x, y, c='red', s=100, zorder=5)
        fig.canvas.draw()
        
        if len(selected_points) == 2:
            calculate_and_plot_shortest_path(selected_points)


fig.canvas.mpl_connect('button_press_event', onclick)


def calculate_and_plot_shortest_path(points):
    node1 = ox.distance.nearest_nodes(graph, points[0][1], points[0][0])  
    node2 = ox.distance.nearest_nodes(graph, points[1][1], points[1][0])  
    
    shortest_path = nx.shortest_path(graph, node1, node2, weight='length')
    
    ox.plot_graph_route(graph, shortest_path, route_linewidth=6, node_size=0, bgcolor='k', ax=ax, show=False, close=False)
    
    for point in points:
        ax.scatter(point[1], point[0], c='red', s=100, zorder=5)
    
    plt.show()

print("Please click on the map to select two points.")
plt.show()