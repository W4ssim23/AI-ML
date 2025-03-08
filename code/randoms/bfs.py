
graph = {
    1:[2,3,4],
    2:[5,7],
    3:[],
    4:[6],
    5:[],
    6:[7],
    7:[],
}


def bfs(graph,start):
    visited = []
    queue = [start]
    
    while queue:
        node = queue.pop(0)
        if node not in visited:
            visited.append(node)
            neighbours = graph[node]
            
            for neighbour in neighbours:
                if neighbour not in visited :
                    queue.append(neighbour)
    return visited

def bfs_shortest_path(graph, start, end):
    visited = []
    queue = [[start]]  
    
    while queue:
        path = queue.pop(0)
        node = path[-1]
        
        if node not in visited:
            visited.append(node)
            
            if node == end:
                return path 
            
            neighbours = graph[node]
            
            for neighbour in neighbours:
                if neighbour not in visited:
                    new_path = list(path)
                    new_path.append(neighbour)
                    queue.append(new_path)
    
    return None



print(bfs(graph,1))
print(bfs_shortest_path(graph,1,7))
