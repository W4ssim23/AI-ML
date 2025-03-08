import pygame
import random
import heapq
import time
from collections import deque

# Window and display settings
SIDEBAR_WIDTH = 250
MAZE_WIDTH = 800
WINDOW_WIDTH = SIDEBAR_WIDTH + MAZE_WIDTH
HEIGHT = 600
CELL_SIZE = 20
COLS = MAZE_WIDTH // CELL_SIZE
ROWS = HEIGHT // CELL_SIZE

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
BLUE = (0, 0, 255)
GRAY = (128, 128, 128)
LIGHT_GRAY = (200, 200, 200)
YELLOW = (255, 255, 0)
PURPLE = (128, 0, 128)
ORANGE = (255, 165, 0)
DARK_BLUE = (0, 0, 128)

pygame.init()
screen = pygame.display.set_mode((WINDOW_WIDTH, HEIGHT))
pygame.display.set_caption("Enhanced Maze Solver")
font = pygame.font.Font(None, 24)
small_font = pygame.font.Font(None, 18)

directions = [(0, -1), (1, 0), (0, 1), (-1, 0)]  # Top, Right, Bottom, Left

def create_grid():
    return [[{"visited": False, "walls": [True, True, True, True]} for _ in range(COLS)] for _ in range(ROWS)]

def calculate_stats(path):
    if not path:
        return 0, 0
    return len(path), len(path) / (COLS * ROWS) * 100

def draw_maze(grid, current_path=None, solution_path=None, player_pos=None, obstacles=None):
    pygame.draw.rect(screen, LIGHT_GRAY, (0, 0, SIDEBAR_WIDTH, HEIGHT))
    
    for y in range(ROWS):
        for x in range(COLS):
            cell = grid[y][x]
            x_pixel = SIDEBAR_WIDTH + x * CELL_SIZE
            y_pixel = y * CELL_SIZE
            
            # Draw cell background based on its state
            if obstacles and (x, y) in obstacles:
                pygame.draw.rect(screen, ORANGE, (x_pixel, y_pixel, CELL_SIZE, CELL_SIZE))
            elif current_path and (x, y) in current_path:
                pygame.draw.rect(screen, BLUE, (x_pixel, y_pixel, CELL_SIZE, CELL_SIZE))
            elif solution_path and (x, y) in solution_path:
                pygame.draw.rect(screen, YELLOW, (x_pixel, y_pixel, CELL_SIZE, CELL_SIZE))
            
            # Draw walls
            if cell["walls"][0]:  # Top
                pygame.draw.line(screen, BLACK, (x_pixel, y_pixel), (x_pixel + CELL_SIZE, y_pixel), 2)
            if cell["walls"][1]:  # Right
                pygame.draw.line(screen, BLACK, (x_pixel + CELL_SIZE, y_pixel), (x_pixel + CELL_SIZE, y_pixel + CELL_SIZE), 2)
            if cell["walls"][2]:  # Bottom
                pygame.draw.line(screen, BLACK, (x_pixel, y_pixel + CELL_SIZE), (x_pixel + CELL_SIZE, y_pixel + CELL_SIZE), 2)
            if cell["walls"][3]:  # Left
                pygame.draw.line(screen, BLACK, (x_pixel, y_pixel), (x_pixel, y_pixel + CELL_SIZE), 2)
    
    # Draw start and end
    pygame.draw.rect(screen, GREEN, (SIDEBAR_WIDTH, 0, CELL_SIZE, CELL_SIZE))
    pygame.draw.rect(screen, RED, (SIDEBAR_WIDTH + (COLS-1)*CELL_SIZE, (ROWS-1)*CELL_SIZE, CELL_SIZE, CELL_SIZE))
    
    # Draw player
    if player_pos:
        player_x, player_y = player_pos
        center_x = SIDEBAR_WIDTH + player_x * CELL_SIZE + CELL_SIZE // 2
        center_y = player_y * CELL_SIZE + CELL_SIZE // 2
        pygame.draw.circle(screen, PURPLE, (center_x, center_y), CELL_SIZE // 2 - 2)

def generate_maze_stepwise(grid, remove_walls_percent=0):
    stack = [(0, 0)]
    grid[0][0]["visited"] = True
    
    while stack:
        x, y = stack[-1]
        neighbors = []
        
        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < COLS and 0 <= ny < ROWS and not grid[ny][nx]["visited"]:
                neighbors.append((nx, ny))
        
        if neighbors:
            nx, ny = random.choice(neighbors)
            grid[ny][nx]["visited"] = True
            
            # Remove walls
            if nx == x + 1:  # Right
                grid[y][x]["walls"][1] = False
                grid[ny][nx]["walls"][3] = False
            elif nx == x - 1:  # Left
                grid[y][x]["walls"][3] = False
                grid[ny][nx]["walls"][1] = False
            elif ny == y + 1:  # Bottom
                grid[y][x]["walls"][2] = False
                grid[ny][nx]["walls"][0] = False
            elif ny == y - 1:  # Top
                grid[y][x]["walls"][0] = False
                grid[ny][nx]["walls"][2] = False
            
            stack.append((nx, ny))
            yield
        else:
            stack.pop()
            yield
    
    # Randomly remove walls to create multiple paths (if requested)
    if remove_walls_percent > 0:
        total_internal_walls = (COLS - 1) * ROWS + COLS * (ROWS - 1)
        walls_to_remove = int(total_internal_walls * (remove_walls_percent / 100))
        
        for _ in range(walls_to_remove):
            x = random.randint(0, COLS - 1)
            y = random.randint(0, ROWS - 1)
            wall_idx = random.randint(0, 3)
            
            # Find adjacent cell based on the wall
            nx, ny = x, y
            if wall_idx == 0 and y > 0:  # Top
                ny = y - 1
                grid[y][x]["walls"][0] = False
                grid[ny][nx]["walls"][2] = False
            elif wall_idx == 1 and x < COLS - 1:  # Right
                nx = x + 1
                grid[y][x]["walls"][1] = False
                grid[ny][nx]["walls"][3] = False
            elif wall_idx == 2 and y < ROWS - 1:  # Bottom
                ny = y + 1
                grid[y][x]["walls"][2] = False
                grid[ny][nx]["walls"][0] = False
            elif wall_idx == 3 and x > 0:  # Left
                nx = x - 1
                grid[y][x]["walls"][3] = False
                grid[ny][nx]["walls"][1] = False
            
            yield

def add_random_obstacles(grid, count):
    obstacles = set()
    for _ in range(count):
        # Avoid start and end positions
        while True:
            x = random.randint(0, COLS-1)
            y = random.randint(0, ROWS-1)
            if (x, y) != (0, 0) and (x, y) != (COLS-1, ROWS-1) and (x, y) not in obstacles:
                obstacles.add((x, y))
                # Block all passages through this cell
                for i in range(4):
                    grid[y][x]["walls"][i] = True
                break
    return obstacles

def bfs_solve(grid, start, end, obstacles=None):
    queue = deque([(start, [start])])
    visited = set()
    
    while queue:
        current, path = queue.popleft()
        if current in visited:
            continue
        visited.add(current)
        
        if current == end:
            return visited, path
        
        x, y = current
        for i, (dx, dy) in enumerate(directions):
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if (0 <= nx < COLS and 0 <= ny < ROWS and 
                not grid[y][x]["walls"][i] and 
                (obstacles is None or neighbor not in obstacles)):
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor]))
        
        yield visited, []
    return visited, []

def dfs_solve(grid, start, end, obstacles=None):
    stack = [(start, [start])]
    visited = set()
    
    while stack:
        current, path = stack.pop()
        if current in visited:
            continue
        visited.add(current)
        
        if current == end:
            return visited, path
        
        x, y = current
        for i, (dx, dy) in enumerate(directions):
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if (0 <= nx < COLS and 0 <= ny < ROWS and 
                not grid[y][x]["walls"][i] and 
                (obstacles is None or neighbor not in obstacles)):
                if neighbor not in visited:
                    stack.append((neighbor, path + [neighbor]))
        
        yield visited, []
    return visited, []

def heuristic(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def astar_solve(grid, start, end, obstacles=None):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    f_score = {start: heuristic(start, end)}
    visited = set()
    
    while open_set:
        current = heapq.heappop(open_set)[1]
        visited.add(current)
        
        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return visited, path[::-1]
        
        x, y = current
        for i, (dx, dy) in enumerate(directions):
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if (0 <= nx < COLS and 0 <= ny < ROWS and 
                not grid[y][x]["walls"][i] and 
                (obstacles is None or neighbor not in obstacles)):
                tentative_g = g_score.get(current, float('inf')) + 1
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score[neighbor] = tentative_g + heuristic(neighbor, end)
                    if neighbor not in [i[1] for i in open_set if isinstance(i, tuple) and len(i) > 1]:
                        heapq.heappush(open_set, (f_score[neighbor], neighbor))
        
        yield visited, []
    return visited, []

def dijkstra_solve(grid, start, end, obstacles=None):
    open_set = []
    heapq.heappush(open_set, (0, start))
    came_from = {}
    g_score = {start: 0}
    visited = set()
    
    while open_set:
        current_g, current = heapq.heappop(open_set)
        visited.add(current)
        
        if current == end:
            path = []
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return visited, path[::-1]
        
        x, y = current
        for i, (dx, dy) in enumerate(directions):
            nx, ny = x + dx, y + dy
            neighbor = (nx, ny)
            if (0 <= nx < COLS and 0 <= ny < ROWS and 
                not grid[y][x]["walls"][i] and 
                (obstacles is None or neighbor not in obstacles)):
                tentative_g = g_score.get(current, float('inf')) + 1
                if tentative_g < g_score.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    if neighbor not in [i[1] for i in open_set if isinstance(i, tuple) and len(i) > 1]:
                        heapq.heappush(open_set, (tentative_g, neighbor))
        
        yield visited, []
    return visited, []

def draw_button(screen, rect, text, active, font, color=BLACK):
    bg_color = LIGHT_GRAY if active else (100, 100, 100)
    pygame.draw.rect(screen, bg_color, rect)
    pygame.draw.rect(screen, color, rect, 2)  # Border
    text_surf = font.render(text, True, BLACK if active else LIGHT_GRAY)
    text_rect = text_surf.get_rect(center=rect.center)
    screen.blit(text_surf, text_rect)
    return rect.collidepoint(pygame.mouse.get_pos())

def draw_checkbox(screen, rect, text, checked, font):
    pygame.draw.rect(screen, WHITE, rect)
    pygame.draw.rect(screen, BLACK, rect, 2)
    if checked:
        pygame.draw.line(screen, BLACK, (rect.left + 4, rect.centery), (rect.centerx - 2, rect.bottom - 4), 2)
        pygame.draw.line(screen, BLACK, (rect.centerx - 2, rect.bottom - 4), (rect.right - 4, rect.top + 4), 2)
    
    text_surf = font.render(text, True, BLACK)
    screen.blit(text_surf, (rect.right + 10, rect.centery - text_surf.get_height() // 2))
    return rect.collidepoint(pygame.mouse.get_pos())

def draw_slider(screen, x, y, width, value, min_val, max_val, text):
    # Draw track
    track_rect = pygame.Rect(x, y + 10, width, 5)
    pygame.draw.rect(screen, BLACK, track_rect)
    
    # Calculate position
    pos = x + int((value - min_val) / (max_val - min_val) * width)
    
    # Draw handle
    handle_rect = pygame.Rect(pos - 5, y + 5, 10, 15)
    pygame.draw.rect(screen, WHITE, handle_rect)
    pygame.draw.rect(screen, BLACK, handle_rect, 2)
    
    # Draw text and value
    text_surf = font.render(f"{text}: {value}", True, BLACK)
    screen.blit(text_surf, (x, y - 20))
    
    return handle_rect.collidepoint(pygame.mouse.get_pos()), handle_rect, track_rect

def can_move(grid, pos, direction, obstacles=None):
    x, y = pos
    i = directions.index(direction)
    
    if grid[y][x]["walls"][i]:
        return False
    
    nx, ny = x + direction[0], y + direction[1]
    if not (0 <= nx < COLS and 0 <= ny < ROWS):
        return False
    
    if obstacles and (nx, ny) in obstacles:
        return False
    
    return True

def draw_stats(screen, x, y, algorithm, execution_time, nodes_explored, path_length, completion_percent):
    stats_rect = pygame.Rect(x, y, SIDEBAR_WIDTH - 20, 150)
    pygame.draw.rect(screen, WHITE, stats_rect)
    pygame.draw.rect(screen, BLACK, stats_rect, 2)
    
    title_surf = font.render("Algorithm Stats", True, BLACK)
    screen.blit(title_surf, (x + 10, y + 10))
    
    algorithm_surf = small_font.render(f"Algorithm: {algorithm}", True, BLACK)
    screen.blit(algorithm_surf, (x + 10, y + 40))
    
    time_surf = small_font.render(f"Time: {execution_time:.2f} sec", True, BLACK)
    screen.blit(time_surf, (x + 10, y + 60))
    
    nodes_surf = small_font.render(f"Nodes Explored: {nodes_explored}", True, BLACK)
    screen.blit(nodes_surf, (x + 10, y + 80))
    
    path_surf = small_font.render(f"Path Length: {path_length}", True, BLACK)
    screen.blit(path_surf, (x + 10, y + 100))
    
    percent_surf = small_font.render(f"Completion: {completion_percent:.1f}%", True, BLACK)
    screen.blit(percent_surf, (x + 10, y + 120))

def draw_help(screen):
    help_surf = pygame.Surface((MAZE_WIDTH, HEIGHT))
    help_surf.set_alpha(230)
    help_surf.fill(WHITE)
    
    title_surf = font.render("Maze Game Controls", True, BLACK)
    help_surf.blit(title_surf, (MAZE_WIDTH//2 - title_surf.get_width()//2, 50))
    
    instructions = [
        "Arrow Keys: Move player in manual mode",
        "M: Toggle manual player mode",
        "R: Reset the maze",
        "Space: Generate new maze",
        "S: Solve maze with selected algorithm",
        "ESC: Close this help screen",
        "H: Show/hide this help",
        "P: Pause/resume simulation"
    ]
    
    for i, instruction in enumerate(instructions):
        inst_surf = small_font.render(instruction, True, BLACK)
        help_surf.blit(inst_surf, (MAZE_WIDTH//2 - inst_surf.get_width()//2, 100 + i*30))
    
    screen.blit(help_surf, (SIDEBAR_WIDTH, 0))

def main():
    # Game state
    grid = create_grid()
    generator = None
    solver = None
    current_path = []
    solution_path = []
    obstacles = set()
    
    # UI states
    is_generating = False
    is_solving = False
    show_dropdown = False
    show_help = False
    manual_mode = False
    player_pos = (0, 0)
    paused = False
    
    # Algorithm settings
    selected_algorithm = "A*"
    algorithms = ["A*", "BFS", "DFS", "Dijkstra"]
    speed = 10  # Steps per frame
    remove_walls_percent = 0
    obstacle_count = 0
    dragging_slider = False
    active_slider = None
    
    # Stats
    execution_time = 0
    start_time = 0
    nodes_explored = 0
    path_length = 0
    completion_percent = 0
    
    # Buttons
    button_height = 30
    button_margin = 10
    buttons_y = [10 + i*(button_height + button_margin) for i in range(6)]
    
    reset_rect = pygame.Rect(10, buttons_y[0], SIDEBAR_WIDTH-20, button_height)
    generate_rect = pygame.Rect(10, buttons_y[1], SIDEBAR_WIDTH-20, button_height)
    solve_rect = pygame.Rect(10, buttons_y[2], SIDEBAR_WIDTH-20, button_height)
    stop_rect = pygame.Rect(10, buttons_y[3], SIDEBAR_WIDTH-20, button_height)
    algo_rect = pygame.Rect(10, buttons_y[4], SIDEBAR_WIDTH-20, button_height)
    help_rect = pygame.Rect(10, buttons_y[5], SIDEBAR_WIDTH-20, button_height)
    
    dropdown_rects = [pygame.Rect(10, buttons_y[4] + (i+1)*button_height, SIDEBAR_WIDTH-20, button_height) for i in range(len(algorithms))]
    
    # Checkboxes
    manual_rect = pygame.Rect(10, HEIGHT - 120, 15, 15)
    
    running = True
    clock = pygame.time.Clock()
    
    while running:
        screen.fill(WHITE)
        mx, my = pygame.mouse.get_pos()
        
        # Event handling
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    show_help = False
                elif event.key == pygame.K_h:
                    show_help = not show_help
                elif event.key == pygame.K_r:
                    grid = create_grid()
                    solution_path = []
                    current_path = []
                    obstacles = set()
                    player_pos = (0, 0)
                elif event.key == pygame.K_SPACE:
                    grid = create_grid()
                    generator = generate_maze_stepwise(grid, remove_walls_percent)
                    is_generating = True
                    solution_path = []
                    current_path = []
                    obstacles = set()
                    player_pos = (0, 0)
                elif event.key == pygame.K_m:
                    manual_mode = not manual_mode
                    player_pos = (0, 0)
                elif event.key == pygame.K_p:
                    paused = not paused
                
                # Player movement in manual mode
                if manual_mode:
                    if event.key == pygame.K_UP and can_move(grid, player_pos, (0, -1), obstacles):
                        player_pos = (player_pos[0], player_pos[1] - 1)
                    elif event.key == pygame.K_RIGHT and can_move(grid, player_pos, (1, 0), obstacles):
                        player_pos = (player_pos[0] + 1, player_pos[1])
                    elif event.key == pygame.K_DOWN and can_move(grid, player_pos, (0, 1), obstacles):
                        player_pos = (player_pos[0], player_pos[1] + 1)
                    elif event.key == pygame.K_LEFT and can_move(grid, player_pos, (-1, 0), obstacles):
                        player_pos = (player_pos[0] - 1, player_pos[1])
            
            if event.type == pygame.MOUSEBUTTONDOWN:
                # Handle button clicks
                if reset_rect.collidepoint(mx, my) and not is_generating and not is_solving:
                    grid = create_grid()
                    solution_path = []
                    current_path = []
                    obstacles = set()
                    player_pos = (0, 0)
                
                if generate_rect.collidepoint(mx, my) and not is_generating and not is_solving:
                    grid = create_grid()
                    generator = generate_maze_stepwise(grid, remove_walls_percent)
                    is_generating = True
                    solution_path = []
                    current_path = []
                    obstacles = set()
                    player_pos = (0, 0)
                
                if solve_rect.collidepoint(mx, my) and not is_generating and not is_solving:
                    is_solving = True
                    start = (0, 0)
                    end = (COLS-1, ROWS-1)
                    
                    # Add obstacles if needed
                    if obstacle_count > 0:
                        obstacles = add_random_obstacles(grid, obstacle_count)
                    
                    # Start timer
                    start_time = time.time()
                    
                    # Select appropriate algorithm
                    if selected_algorithm == "A*":
                        solver = astar_solve(grid, start, end, obstacles)
                    elif selected_algorithm == "BFS":
                        solver = bfs_solve(grid, start, end, obstacles)
                    elif selected_algorithm == "DFS":
                        solver = dfs_solve(grid, start, end, obstacles)
                    elif selected_algorithm == "Dijkstra":
                        solver = dijkstra_solve(grid, start, end, obstacles)
                
                if stop_rect.collidepoint(mx, my) and (is_generating or is_solving):
                    is_generating = False
                    is_solving = False
                    generator = None
                    solver = None
                
                if algo_rect.collidepoint(mx, my):
                    show_dropdown = not show_dropdown
                else:
                    for i, rect in enumerate(dropdown_rects):
                        if rect.collidepoint(mx, my) and show_dropdown:
                            selected_algorithm = algorithms[i]
                            show_dropdown = False
                
                if help_rect.collidepoint(mx, my):
                    show_help = not show_help
                
                # Handle checkbox click
                if manual_rect.collidepoint(mx, my):
                    manual_mode = not manual_mode
                    player_pos = (0, 0)
                
                # Handle slider clicks
                is_hovering, handle_rect, track_rect = draw_slider(screen, 20, HEIGHT - 90, SIDEBAR_WIDTH - 40, remove_walls_percent, 0, 30, "Wall Removal %")
                if is_hovering:
                    dragging_slider = True
                    active_slider = "walls"
                
                is_hovering, handle_rect, track_rect = draw_slider(screen, 20, HEIGHT - 50, SIDEBAR_WIDTH - 40, obstacle_count, 0, 20, "Obstacles")
                if is_hovering:
                    dragging_slider = True
                    active_slider = "obstacles"
            
            if event.type == pygame.MOUSEBUTTONUP:
                dragging_slider = False
                active_slider = None
            
            if event.type == pygame.MOUSEMOTION and dragging_slider:
                if active_slider == "walls":
                    x_pos = max(20, min(mx, 20 + SIDEBAR_WIDTH - 40))
                    remove_walls_percent = int((x_pos - 20) / (SIDEBAR_WIDTH - 40) * 30)
                elif active_slider == "obstacles":
                    x_pos = max(20, min(mx, 20 + SIDEBAR_WIDTH - 40))
                    obstacle_count = int((x_pos - 20) / (SIDEBAR_WIDTH - 40) * 20)
        
        # Update generation if not paused
        if is_generating and not paused:
            for _ in range(speed):
                try:
                    next(generator)
                except StopIteration:
                    is_generating = False
                    generator = None
                    
                    # Add obstacles after generation if needed
                    if obstacle_count > 0:
                        obstacles = add_random_obstacles(grid, obstacle_count)
                    break
        
        # Update solving if not paused
        if is_solving and not paused:
            for _ in range(speed):
                try:
                    visited, path = next(solver)
                    current_path = visited
                    nodes_explored = len(visited)
                    
                    if path and path[-1] == (COLS-1, ROWS-1):
                        solution_path = path
                        path_length = len(path)
                        completion_percent = (path_length / (COLS * ROWS)) * 100
                        execution_time = time.time() - start_time
                except StopIteration:
                    is_solving = False
                    solver = None
                    
                    # Calculate final stats if not already done
                    if execution_time == 0:
                        execution_time = time.time() - start_time
                        path_length, completion_percent = calculate_stats(solution_path)
                    break
        
        # Draw maze and player
        draw_maze(grid, current_path, solution_path, player_pos if manual_mode else None, obstacles)
        
        # Draw UI elements
        hover_reset = draw_button(screen, reset_rect, "Reset", not (is_generating or is_solving), font)
        hover_generate = draw_button(screen, generate_rect, "Generate Maze", not (is_generating or is_solving), font)
        hover_solve = draw_button(screen, solve_rect, "Solve", not (is_generating or is_solving), font)
        hover_stop = draw_button(screen, stop_rect, "Stop/Pause", (is_generating or is_solving), font)
        hover_algo = draw_button(screen, algo_rect, f"Algorithm: {selected_algorithm}", True, font)
        hover_help = draw_button(screen, help_rect, "Help", True, font)
        
        # Draw algorithm selection dropdown
        if show_dropdown:
            for i, rect in enumerate(dropdown_rects):
                draw_button(screen, rect, algorithms[i], True, font)
        
        # Draw manual mode checkbox
        draw_checkbox(screen, manual_rect, "Manual Player Mode", manual_mode, font)
        
        # Draw sliders
        draw_slider(screen, 20, HEIGHT - 90, SIDEBAR_WIDTH - 40, remove_walls_percent, 0, 30, "Wall Removal %")
        draw_slider(screen, 20, HEIGHT - 50, SIDEBAR_WIDTH - 40, obstacle_count, 0, 20, "Obstacles")
        
        # Draw stats
        draw_stats(screen, 10, HEIGHT - 250, selected_algorithm, execution_time, nodes_explored, path_length, completion_percent)
        
        # Draw status text
        status_text = ""
        if is_generating:
            status_text = "Generating maze..."
        elif is_solving:
            status_text = f"Solving with {selected_algorithm}..."
        elif manual_mode:
            status_text = "Manual mode: Use arrow keys to move"
        
        if paused:
            status_text += " (PAUSED)"
            
        status_surf = font.render(status_text, True, BLACK)
        screen.blit(status_surf, (SIDEBAR_WIDTH//2 - status_surf.get_width()//2, HEIGHT - 20))
        
        # Draw help screen if needed
        if show_help:
            draw_help(screen)
        
        pygame.display.flip()
        clock.tick(60)
    
    pygame.quit()

if __name__ == "__main__":
    main()