import * as T from "@effect-ts/core/Effect"
import type { Newtype } from "@effect-ts/core/Newtype"
import * as Iso from "@effect-ts/monocle/Iso"

import { PlanetContext } from "../app/PlanetContext"
import * as I from "../common/Int"

export interface Position {
  readonly x: I.Int
  readonly y: I.Int
}

export interface PositionHash extends Newtype<"PositionHash", string> {}

export const PositionHash = Iso.newtype<PositionHash>()

export function hashPosition(self: Position) {
  return PositionHash.get(`x: ${self.x} - y: ${self.y}`)
}

export function scale(to: { width: I.Int; height: I.Int }) {
  return (self: Position): Position => ({
    x: I.mod(to.width)(self.x),
    y: I.mod(to.height)(self.y)
  })
}

export const makePosition = (x: I.Int, y: I.Int) =>
  T.gen(function* (_) {
    const { planet } = yield* _(PlanetContext)
    return scale(planet)({ x, y })
  })

export class ObstacleHit {
  readonly _tag = "ObstacleHit"
  constructor(readonly position: Position) {}
}

export function validatePosition(self: Position) {
  return T.gen(function* (_) {
    const { planet } = yield* _(PlanetContext)
    const position = scale(planet)(self)

    if (planet.obstacles.has(hashPosition(position))) {
      return yield* _(T.fail(new ObstacleHit(position)))
    }

    return yield* _(T.succeed(position))
  })
}
