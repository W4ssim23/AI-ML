import random
import curses

screen = curses.initscr()
curses.curs_set(0)


height, width = screen.getmaxyx()

window = curses.newwin(height, width, 0, 0)

window.keypad(True)
window.timeout(100)

snk_x = width // 4
snk_y = height // 2

snk = [
    [snk_y, snk_x],
    [snk_y, snk_x - 1],
    [snk_y, snk_x - 2]
]

food = [height // 2, width // 2]

window.addch(food[0], food[1], curses.ACS_PI)

key = curses.KEY_RIGHT

while True:
    nextkey = window.getch()

    if nextkey != -1:
        key = nextkey

    if  snk[0][0] in [0, height-1]  or snk[0][1] in [0, width-1] or snk[0] in snk[1:] :
        curses.endwin()
        break

    newhead = [snk[0][0], snk[0][1]]

    if key == curses.KEY_RIGHT:
        newhead[1] += 1
    if key == curses.KEY_LEFT:
        newhead[1] -= 1
    if key == curses.KEY_UP:
        newhead[0] -= 1
    if key == curses.KEY_DOWN:
        newhead[0] += 1

    snk.insert(0, newhead)

    if snk[0] == food:
        food = None
        while food is None:
            newfood = [
                random.randint(1, height - 1),
                random.randint(1, width - 1),
            ]
            if newfood not in snk:
                food = newfood
        window.addch(food[0], food[1], curses.ACS_PI)
    else:
        tail = snk.pop()
        window.addch(tail[0], tail[1], " ")

    window.addch(snk[0][0], snk[0][1], curses.ACS_CKBOARD)