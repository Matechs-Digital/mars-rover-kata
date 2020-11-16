import * as T from "@effect-ts/core/Effect"
import { flow, pipe } from "@effect-ts/core/Function"
import { matchTag } from "@effect-ts/core/Utils"

import { LiveAppConfig } from "./app/AppConfig"
import { LiveConsole } from "./app/Console"
import { LivePlanetContext } from "./app/PlanetContext"
import { main } from "./app/Program"
import { LiveReadFile } from "./app/ReadFile"
import { LiveReadLine } from "./app/ReadLine"
import { LiveRoverContext } from "./app/RoverContext"

pipe(
  main,
  T.provideSomeLayer(
    LiveRoverContext["<+<"](LivePlanetContext)
      ["<+<"](LiveAppConfig)
      ["<+<"](LiveReadFile["+++"](LiveReadLine)["+++"](LiveConsole))
  ),
  T.catchAll(
    flow(
      matchTag({
        InvalidPlanetFile: ({ actual }) => `Invalid planet file:\n${actual}`,
        InvalidInitialPosition: ({ hit }) =>
          `Invalid initial position hitting obstacle at: ${hit.position.x}, ${hit.position.y}`,
        ParseCommandError: ({ actual }) => `Invalid command string: ${actual}`,
        ParseObstaclesError: ({ actual }) => `Invalid obstacle config: ${actual}`,
        ParsePlanetError: ({ actual }) => `Invalid planet config: ${actual}`,
        ReadFileError: ({ error }) => `Unknown error reading file: ${error.message}`
      }),
      T.fail
    )
  ),
  T.runMain
)
