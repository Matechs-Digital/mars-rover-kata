import * as E from "@effect-ts/core/Classic/Either"
import { pipe } from "@effect-ts/core/Function"

import * as I from "../common/Int"
import type { Planet } from "../domain/Planet"
import { makePlanet } from "../domain/Planet"

export class ParsePlanetError {
  readonly _tag = "ParsePlanetError"
  constructor(readonly actual: string) {}
}

export const planetRegex = /^(\d+)x(\d+)$/

export function parsePlanet(planetConfig: string): E.Either<ParsePlanetError, Planet> {
  const results = planetRegex.exec(planetConfig)

  if (results == null) {
    return E.left(new ParsePlanetError(planetConfig))
  }

  if (results.length !== 3) {
    return E.left(new ParsePlanetError(planetConfig))
  }

  return pipe(
    E.tuple(I.parse(results[1]), I.parse(results[2])),
    E.chain(([width, height]) => makePlanet({ width, height })),
    E.fold(() => E.left(new ParsePlanetError(planetConfig)), E.right)
  )
}
