import * as A from "@effect-ts/core/Classic/Array"
import * as E from "@effect-ts/core/Classic/Either"
import { pipe } from "@effect-ts/core/Function"

import * as I from "../common/Int"
import type { ObstaclePosition } from "../domain/Planet"

export class ParseObstaclesError {
  readonly _tag = "ParseObstaclesError"
  constructor(readonly actual: string) {}
}

export const obstacleRegex = /^(\d+),(\d+)$/

export function parseObstacle(
  obstacleConfig: string
): E.Either<ParseObstaclesError, ObstaclePosition> {
  const results = obstacleRegex.exec(obstacleConfig)

  if (results == null) {
    return E.left(new ParseObstaclesError(obstacleConfig))
  }

  return pipe(
    E.tuple(I.parse(results[1]), I.parse(results[2])),
    E.map(([x, y]): ObstaclePosition => ({ x, y })),
    E.fold(() => E.left(new ParseObstaclesError(obstacleConfig)), E.right)
  )
}

export function parseObstacles(obstaclesConfig: string) {
  if (obstaclesConfig.length === 0) {
    return E.right([])
  }
  return pipe(obstaclesConfig.split(" "), A.foreachF(E.Applicative)(parseObstacle))
}
