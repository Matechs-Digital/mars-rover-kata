import { pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"

import type { Orientation } from "../domain/Orientation"
import type { Position } from "../domain/Position"
import type { NextPositionObstacle } from "./Program"

export function prettyObstacle(e: NextPositionObstacle): string {
  return `O:${e.position.x}:${e.position.y}:${prettyOrientation(e.orientation)}`
}

export function prettyPosition(position: Position, orientation: Orientation): string {
  return `${position.x}:${position.y}:${prettyOrientation(orientation)}`
}

export function prettyOrientation(orientation: Orientation): string {
  return pipe(
    orientation,
    matchTag({
      North: () => "N",
      South: () => "S",
      East: () => "E",
      West: () => "W"
    })
  )
}
