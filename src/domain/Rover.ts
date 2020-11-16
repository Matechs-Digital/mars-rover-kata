import type * as I from "../common/Int"
import type { Orientation } from "./Orientation"
import type { ObstacleHit, Position } from "./Position"

export class Rover {
  readonly _tag = "Rover"
  constructor(readonly position: Position, readonly orientation: Orientation) {}
}

export interface RoverConfiguration {
  position: {
    x: I.Int
    y: I.Int
  }
  orientation: Orientation
}

export function roverConfiguration(
  x: I.Int,
  y: I.Int,
  orientation: Orientation
): RoverConfiguration {
  return {
    orientation,
    position: { x, y }
  }
}

export class InvalidInitialPosition {
  readonly _tag = "InvalidInitialPosition"
  constructor(readonly hit: ObstacleHit) {}
}
