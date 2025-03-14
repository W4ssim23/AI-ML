class Board :
    def __init__(self, state=None):
        if state is None :
            self.state = [[None] * 3 for _ in range(3)]
        else :
            self.state = [row.copy() for row in state]
        played = sum(1 for row in self.state for val in row if val is not None)
        self.turn = 'X' if played % 2 == 0 else 'O'
        self.winner = None
        self.if_won()

    def if_won(self, who = ['X','O']):
        possible_win = [
            [(0,0),(0,1),(0,2)],[(1,0),(1,1),(1,2)],[(2,0),(2,1),(2,2)],
            [(0,0),(1,0),(2,0)],[(0,1),(1,1),(2,1)],[(0,2),(1,2),(2,2)],
            [(0,0),(1,1),(2,2)],[(0,2),(1,1),(2,0)]
        ]
        for turn in who : 
            for pattern in possible_win :
                if all(self.state[x][y] == turn for (x,y) in pattern) :
                    self.winner = turn
                    return
        if self.winner is None and sum(1 for row in self.state for val in row if val is not None) == 9 :
            self.winner = 'tie'

    def make_move(self,pos_x,pos_y):
        if  not  0 <= pos_x < 3  or not 0 <= pos_y < 3  or self.state[pos_x][pos_y] or self.winner is not None :
            return 
        self.state[pos_x][pos_y] = self.turn
        self.if_won([self.turn])
        self.turn = 'X' if self.turn != 'X' else 'O'

    def reset(self):
        self.state = [[None] * 3 for _ in range(3)]
        self.turn = 'X'
        self.winner = None

    def future_state(self,pos_x,pos_y):
        future_board = Board(state=self.state)
        if  not  0 <= pos_x < 3  or not 0 <= pos_y < 3  or future_board.state[pos_x][pos_y] or future_board.winner is not None :
            return None
        future_board.state[pos_x][pos_y] = future_board.turn
        future_board.if_won([future_board.turn])
        future_board.turn = 'X' if future_board.turn != 'X' else 'O'
        return future_board

    def possible_moves(self): 
        res = []
        for x, row in enumerate(self.state) :
            for y, _ in enumerate(row) :
                if self.state[x][y] is None :
                    possible_move = self.future_state(x,y)
                    if possible_move is not None :
                        res.append(possible_move)
        return res

    def __str__(self):
        board = ''
        for row in self.state : 
            board += "| " + " | ".join(cell if cell is not None else ' ' for cell in row) + " |\n"
        return board
    

def evaluation(board : Board):
    if board.winner == 'X' :
        return 1
    if board.winner == 'O' :
        return -1
    return 0


def minimax(board : Board,alpha , beta,maximizing):
    if board.winner is not None :
        return evaluation(board) 
    
    if maximizing :
        val = -float('inf')
        for possible_move in board.possible_moves() :
            val = max(val , minimax(possible_move, alpha, beta, False))
            alpha = max(val, alpha)
            if beta <= alpha :
                break
        return val
    else :
        val = float('inf')
        for possible_move in board.possible_moves() :
            val = min(val , minimax(possible_move, alpha, beta, True))
            beta = min(val,beta)
            if beta <= alpha :
                break
        return val

def agent(board:Board):
    if board.winner is not None :
        print('cant play')
        return None
    
    maximizing = True if board.turn == 'X' else False
    infinity = -float('inf') if maximizing else float('inf')
    alpha , beta = -float('inf') , float('inf')
    possible_moves = board.possible_moves()

    if not possible_moves :
        return None

    resp = {'val' :infinity , 'next_move' : None}
    for idx , move in enumerate(possible_moves) :
        val = minimax(move, alpha, beta, not maximizing)
        if maximizing and val > resp['val'] :
            resp = {'val':val , 'next_move':idx}
            alpha = max(alpha, val)
        elif not maximizing and val < resp['val'] :
            resp = {'val':val , 'next_move':idx}
            beta = min(beta, val)
    return possible_moves[resp['next_move']]


runing = True
board = Board()
while runing :
    print(board)
    if board.winner :
        print('Game over , winner is',board.winner)
        break
    if board.turn == 'X':
        cords = input('cords')
        x, y = list(map(int, cords))
        board.make_move(x, y)
    else:
        next_board = agent(board)
        if next_board is not None:
            board = next_board
        else:
            print("No possible moves left.")
            break
