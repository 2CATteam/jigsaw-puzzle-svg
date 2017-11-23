#!/usr/bin/python
"""Jigsaw puzzle creator."""

import random
import numpy as np

piece_width = 100
piece_height = 87
num_pieces_h = 18
num_pieces_v = 12

HEADER = """<?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
     x="0px" y="0px" width="%dpx" height="%dpx">
""" % (piece_width * num_pieces_h, piece_height * num_pieces_v)

FOOTER = """</svg>"""

corner_jiggle = piece_width * 0.15
# corner_jiggle = piece_width * 0.3

bezier_size_x = piece_width * 0.2
bezier_size_y = piece_height * 0.2

def write_path(f, path_def):
  f.write('<path stroke="#ff0000" fill="transparent" d="%s" />' % path_def)


def jiggle(value, max_jiggle):
  return value + np.random.random() * max_jiggle - max_jiggle / 2


def circle(f, pt, radius=3, color='blue'):
  f.write('<circle cx="%d" cy="%d" r="%d" stroke="black" fill="%s" />' % (
      pt[0], pt[1], radius, color))


def main():
  print('%dx%d puzzle (%d pieces), size %dx%d, aspect ratio %.3f' % (
      num_pieces_h, num_pieces_v, num_pieces_h*num_pieces_v,
      piece_width*num_pieces_h, piece_height*num_pieces_v,
      float(piece_width*num_pieces_h) / (piece_height*num_pieces_v)))

  #f = open('/usr/local/google/home/zvika/Downloads/zvika_puzzle.svg', 'w')
  f = open('zvika_puzzle.svg','w')

  f.write(HEADER)

  write_path(f, 'M 0,0 L {0},0 L {0},{1} L 0,{1} L 0,0'.format(
      piece_width * num_pieces_h, piece_height * num_pieces_v))

  corners = np.mgrid[0:piece_width*num_pieces_h:(num_pieces_h+1)*1j,
                     0:piece_height*num_pieces_v:(num_pieces_v+1)*1j]
  jiggle_shape = corners[:, 1:-1, 1:-1].shape
  corners[:, 1:-1, 1:-1] += np.random.random(jiggle_shape) * corner_jiggle
  corners[:, 1:-1, 1:-1] -= corner_jiggle / 2

  # Top-down curves
  for i in range(1, num_pieces_h):
    s = 'M {0},{1} '.format(corners[0, i, 0], corners[1, i, 0])

    for j in range(1, num_pieces_v + 1):
      # Extrude direction
      if np.random.random() < 0.5:
        extrude_dir = 1
      else:
        extrude_dir = -1

      # Pre-midpoint
      premidpt = 0.375*corners[:,i,j] + 0.625*corners[:,i,j-1]
      premidpt[0] += extrude_dir * jiggle(piece_width*0.05, piece_width*0.05)
      premidpt[1] += jiggle(piece_height*0.05, piece_height*0.02)
      s += 'S {0},{1} {2},{3} '.format(
              premidpt[0] - 0.07*piece_width*extrude_dir, premidpt[1],
              premidpt[0], premidpt[1])

      # Midpoint
      midpt = 0.5*corners[:, i, j] + 0.5*corners[:, i, j-1]
      midpt_extrude = jiggle(piece_width * 0.2, piece_width * 0.1)
      midpt[0] += extrude_dir * midpt_extrude
      midpt[1] += jiggle(0, piece_height*0.1)
      s += 'S {0},{1} {2},{3} '.format(
          midpt[0], midpt[1] - 0.22*piece_height,
          midpt[0], midpt[1])

      # Post-midpoint
      postmidpt = 0.625*corners[:,i,j] + 0.375*corners[:,i,j-1]
      postmidpt[0] = premidpt[0]
      postmidpt[1] -= jiggle(piece_height*0.05, piece_height*0.02)
      s += 'S {0},{1} {2},{3} '.format(
          postmidpt[0] + 0.07*piece_width*extrude_dir, postmidpt[1],
          postmidpt[0], postmidpt[1])

      # Corner
      target = corners[:, i, j]
      nudge = np.random.random(2) * (2, -5) + (2, -5)
      s += 'S {0},{1} {2},{3}'.format(
          target[0] + nudge[0],
          target[1] + nudge[1],
          target[0], target[1])

    write_path(f, s)

  # Left-right curves
  for j in range(1, num_pieces_v):
    s = 'M {0},{1} '.format(corners[0, 0, j], corners[1, 0, j])

    for i in range(1, num_pieces_h + 1):
      # Extrude direction
      if np.random.random() < 0.5:
        extrude_dir = 1
      else:
        extrude_dir = -1

      # Pre-midpoint
      premidpt = 0.375*corners[:,i,j] + 0.625*corners[:,i-1,j]
      premidpt[0] += jiggle(piece_width*0.05, piece_width*0.02)
      premidpt[1] += extrude_dir * jiggle(piece_height*0.05, piece_height*0.05)
      s += 'S {0},{1} {2},{3}'.format(
              premidpt[0], premidpt[1] - 0.07*piece_height*extrude_dir,
              premidpt[0], premidpt[1])

      # Midpoint
      midpt = 0.5*corners[:,i,j] + 0.5*corners[:,i-1,j]
      midpt_extrude = jiggle(piece_height*0.2, piece_height*0.1)
      midpt[0] += jiggle(0, piece_width*0.1)
      midpt[1] += extrude_dir * midpt_extrude
      s += 'S {0},{1} {2},{3} '.format(
              midpt[0] - 0.22*piece_width, midpt[1],
              midpt[0], midpt[1])

      # Post-midpoint
      postmidpt = 0.625*corners[:,i,j] + 0.375*corners[:,i-1,j]
      postmidpt[0] -= jiggle(piece_width*0.05, piece_width*0.02)
      postmidpt[1] = premidpt[1]
      s += 'S {0},{1} {2},{3} '.format(
              postmidpt[0], postmidpt[1] + 0.07*piece_height*extrude_dir,
              postmidpt[0], postmidpt[1])
 
      target = corners[:, i, j]
      nudge = np.random.random(2) * (-10, -5) + (-10, -5)
      s += 'S {0},{1} {2},{3} '.format(
          target[0] + nudge[0],
          target[1] + nudge[1],
          target[0], target[1])

    write_path(f, s)

  f.write(FOOTER)
  f.close()


if __name__ == '__main__':
  main()
