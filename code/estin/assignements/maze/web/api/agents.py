import random
import math
import heapq 
import time

directions = [(0,1),(0,-1),(1,0),(-1,0)]

def initial_maze(width=10,height=10):
    return {
        "state":[[ {"visited":False ,"walls":[True]*4 } for _ in range(width) ] for _ in range(height)] ,
        "width":width,
        "height":height
            }

def get_neighbors(x,y,maze):
    can_visit = []
    for di in directions :
        dx,dy = di
        if  0 <= x + dx < maze["height"] and 0 <= y + dy < maze["width"] : 
            if maze["state"][x + dx][y + dy]["visited"] is False :
                can_visit.append((x+dx,y+dy))
    return  can_visit

def new_walls(current_cell,x,y,adj_x,adj_y):
    walls = current_cell["walls"]
    if x == adj_x and y < adj_y :   #right
        walls[0] = False
    if x == adj_x and y > adj_y :   #left
        walls[1] = False
    if x < adj_x and y == adj_y :   #down
        walls[2] = False
    if x > adj_x and y == adj_y :   #up
        walls[3] = False
    return walls


def generate_maze(height=10,width=10,start=(0,0)):

    maze = initial_maze(height,width)

    stack = [start]

    start_time = time.time()

    while stack :
        current = stack.pop(-1)
        x , y = current
        maze["state"][x][y]["visited"] = True
        adjs = get_neighbors(x,y,maze)
        if adjs :
            adj = random.choice(adjs)
            adj_x,adj_y = adj
            maze["state"][x][y]["walls"] = new_walls(maze["state"][x][y],x,y,adj_x,adj_y)
            maze["state"][adj_x][adj_y]["walls"] = new_walls(maze["state"][adj_x][adj_y],adj_x,adj_y,x,y)
            stack.append((x, y))
            stack.append((adj_x,adj_y))

    end_time = time.time()

    return maze , end_time - start_time

def get_reachable_neighbours(maze,cred):
    directions = [(0,1),(0,-1),(1,0),(-1,0)] #right left down up
    i , j = cred
    can_visit = []
    for idx , val in enumerate(maze["state"][i][j]["walls"]) :
        if val is False :
            x , y = directions[idx]
            can_visit.append((x+i,y+j))
    return  can_visit


def euclidian_distance_heuristic(a,b): 
    return math.sqrt((b[0] - a[0])**2 + (b[1] - a[1])**2 )


def manhattan_distance_heuristic(a,b):
    return  abs(b[0] - a[0]) + abs(b[1] - a[1])


# Agents

def bfs_agent(maze, start, end, with_steps=False):
    visited = set()
    queue = [[start]]  

    steps = [] # has nothing to do with the algorithm, just for visualization
    start_time = time.time()
    
    while queue:
        path = queue.pop(0)
        node = path[-1]
        steps.append(path)
        
        if node not in visited:
            visited.add(node)
            
            if node == end:
                end_time = time.time()
                if not with_steps:
                    return {
                            "path":path ,
                            "time": end_time - start_time ,
                            "visited":visited
                            }
                return {
                        "path":path ,
                        "time": end_time - start_time ,
                        "visited":visited ,
                        "steps":steps
                        }
            
            neighbours = get_reachable_neighbours(maze,node)
            for neighbour in neighbours:
                if neighbour not in visited:
                    new_path = list(path)
                    new_path.append(neighbour)
                    queue.append(new_path)
    
    return None

def dfs_agent(maze, start, end, with_steps=False):
    visited = set()
    stack = [[start]]  

    steps = []
    start_time = time.time()
    
    while stack:
        path = stack.pop()
        node = path[-1]
        steps.append(path)
        
        if node not in visited:
            visited.add(node)
            
            if node == end:
                end_time = time.time()
                if not with_steps:
                    return {
                            "path":path ,
                            "time": end_time - start_time ,
                            "visited":visited
                            }
                return {
                        "path":path ,
                        "time": end_time - start_time ,
                        "visited":visited ,
                        "steps":steps
                        }
            
            neighbours = get_reachable_neighbours(maze,node)
            for neighbour in neighbours:
                if neighbour not in visited:
                    new_path = list(path)
                    new_path.append(neighbour)
                    stack.append(new_path)
    
    return None



def a_star_agent(maze, start, end , heuristic, with_steps=False):

    open_set = [] 
    closed_set = {} 

    heapq.heappush(open_set,(0,start,[start]))
    closed_set[start] = 0

    start_time = time.time()
    steps = []

    while open_set :
        f , current , path = heapq.heappop(open_set)
        steps.append(path)

        if current == end :
            end_time = time.time()
            if not with_steps:
                return {
                        "path":path ,
                        "time": end_time - start_time ,
                        "visited":closed_set.keys()
                        }
            return {
                    "path":path ,
                    "time": end_time - start_time ,
                    "visited":closed_set.keys() ,
                    "steps":steps
                    }

        if current in closed_set and closed_set[current] < f :
            continue

        if (current in closed_set and closed_set[current] > f) or current not in closed_set :
            closed_set[current] = f

        for neighbor in get_reachable_neighbours(maze , current) :
            g = len(path)
            h = heuristic(neighbor,end)
            f = h + g
            heapq.heappush(open_set,(f,neighbor,path + [neighbor]))

    return None
