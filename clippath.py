from math import cos, sin, asin, atan, radians


def clippath(W=0, R=0.05):
    """
    Each hexagon has to be rendered with a slight margin (to make room for roads) and a circular cutout on the
    corner (to make room for settlements). This is done with an SVG clip path. This function generates that clip
    path. It is done here, on the server side, because it only ever needs to be calculated once, but I choose
    to leave this code here in case I want to adjust the width of these cutouts.

    I won't even try to explain this code. It's a bunch of geometry that would require a diagram to be sensible.
    :param W: Width of margin around hexagon, as a fraction of the height of the image
    :param R: Radius of corner cutouts, as a fraction of the height of the image
    :return: Clip path text
    """

    if R <= 0:
        R = 0.00000001

    imgh = 1
    imgw = sin(radians(60)) * imgh

    theta = atan(W / R)

    if theta > radians(60):
        pass
        # In this situation, disregard R entirely. It's too small

    a = (R ** 2 + (imgh / 2) ** 2 - (2 * R * (imgh / 2) * cos(radians(60)))) ** 0.5

    z = asin((R * sin(radians(60) - theta)) / a)

    points = []

    for angle in range(30, 360, 60):
        # print("Angle in degrees: {}".format(angle))
        angle = radians(angle)

        dx1 = a * cos(angle - z)
        dy1 = a * sin(angle - z)

        dx2 = a * cos(angle + z)
        dy2 = a * sin(angle + z)

        x1 = (imgw / 2) + dx1
        y1 = (imgh / 2) - dy1
        points.append((x1, y1))

        x2 = (imgw / 2) + dx2
        y2 = (imgh / 2) - dy2
        points.append((x2, y2))
        # print("x: {:7.3f}, y: {:7.3f}".format(x, y))

    string = ''

    for (x1, y1), (x2, y2) in zip(points[0::2], points[1::2]):
        x1 /= imgw
        y1 /= imgh
        x2 /= imgw
        y2 /= imgh

        rx = R / imgw
        ry = R / imgh

        string += "L {x1:.4f} {y1:.4f} A {rx:.4f} {ry:.4f} 0 0 1 {x2:.4f} {y2:.4f} ".format(x1=x1, y1=y1, rx=rx, ry=ry,
                                                                                            x2=x2, y2=y2)

    string = string.replace("L", "M", 1)

    string += 'Z'

    return string
