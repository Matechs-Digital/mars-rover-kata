import * as T from "@effect-ts/core/Effect"
import * as L from "@effect-ts/core/Effect/Layer"
import { tag } from "@effect-ts/core/Has"
import type { _A } from "@effect-ts/core/Utils"
import * as P from "path"

import { ReadFile } from "./ReadFile"

export class InvalidPlanetFile {
  readonly _tag = "InvalidPlanetFile"
  constructor(readonly actual: string) {}
}

export const makeAppConfig = T.gen(function* (_) {
  const { read } = yield* _(ReadFile)
  const planet = yield* _(read(P.join(__dirname, "../../config/planet.txt")))
  const initial = yield* _(read(P.join(__dirname, "../../config/initial.txt")))

  const lines = planet.split("\n")

  if (lines.length !== 2) {
    return yield* _(T.fail(new InvalidPlanetFile(planet)))
  }

  return { planet: lines[0], initial, obstacles: lines[1] }
})

export interface AppConfig extends _A<typeof makeAppConfig> {}

export const AppConfig = tag<AppConfig>()

export const LiveAppConfig = L.fromEffect(AppConfig)(makeAppConfig)
