import * as E from "@effect-ts/core/Classic/Either"
import { pipe } from "@effect-ts/core/Function"

import * as I from "../common/Int"
import { Orientation } from "../domain/Orientation"
import type { RoverConfiguration } from "../domain/Rover"

export class ParseInitialPositionError {
  readonly _tag = "ParsePlanetError"
  constructor(readonly actual: string) {}
}

export const initialPositionRegex = /^(\d+),(\d+):(N|S|E|W)$/

export function parseInitialPosition(
  initialPositionConfig: string
): E.Either<ParseInitialPositionError, RoverConfiguration> {
  const results = initialPositionRegex.exec(initialPositionConfig)

  if (results == null) {
    return E.left(new ParseInitialPositionError(initialPositionConfig))
  }

  const o = results[3]

  const orientation =
    o === "N"
      ? Orientation.North
      : o === "S"
      ? Orientation.South
      : o === "W"
      ? Orientation.West
      : Orientation.East

  return pipe(
    E.tuple(I.parse(results[1]), I.parse(results[2])),
    E.map(([x, y]): RoverConfiguration => ({ position: { x, y }, orientation })),
    E.fold(() => E.left(new ParseInitialPositionError(initialPositionConfig)), E.right)
  )
}
