import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"

import { addObstacles } from "../domain/Planet"
import { parseObstacles } from "../serde/ObstaclesParser"
import { parsePlanet } from "../serde/PlanetParser"
import { AppConfig } from "./AppConfig"

export const makePlanetContext = T.gen(function* (_) {
  const config = yield* _(AppConfig)
  const parsedPlanet = yield* _(parsePlanet(config.planet))
  const parsedObstacles = yield* _(parseObstacles(config.obstacles))
  const planet = addObstacles(...parsedObstacles)(parsedPlanet)

  return {
    planet
  }
})

export interface PlanetContext extends _A<typeof makePlanetContext> {}

export const PlanetContext = tag<PlanetContext>()

export const LivePlanetContext = L.fromEffect(PlanetContext)(makePlanetContext)
