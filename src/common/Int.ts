/* istanbul ignore file */

import * as E from "@effect-ts/core/Classic/Either"
import * as O from "@effect-ts/core/Classic/Option"
import type { Newtype } from "@effect-ts/core/Newtype"
import * as Iso from "@effect-ts/monocle/Iso"
import * as Prism from "@effect-ts/monocle/Prism"
import { flow, pipe } from "@effect-ts/system/Function"

export interface Int extends Newtype<"Int", number> {}

export class InvalidInteger {
  readonly _tag = "InvalidInteger"
}

export const Int = Prism.newtype<Int>((n) => Number.isInteger(n))

export const IntIso = Iso.newtype<Int>()

export const Zero = IntIso.get(0)
export const One = IntIso.get(1)
export const Two = IntIso.get(2)
export const Three = IntIso.get(3)
export const Four = IntIso.get(4)
export const Five = IntIso.get(5)

export function between(min: Int, max: Int) {
  return flow(
    IntIso.reverseGet,
    (n) => n >= IntIso.reverseGet(min) && n <= IntIso.reverseGet(max)
  )
}

export function gte(min: Int) {
  return flow(IntIso.reverseGet, (n) => n >= IntIso.reverseGet(min))
}

export function mod(m: Int) {
  return flow(
    IntIso.reverseGet,
    (n) => n % Int.reverseGet(m),
    (n) => (n < 0 ? n + Int.reverseGet(m) : n),
    IntIso.get
  )
}

export function add(m: Int) {
  return flow(IntIso.reverseGet, (n) => n + IntIso.reverseGet(m), IntIso.get)
}

export function sub(m: Int) {
  return flow(IntIso.reverseGet, (n) => n - IntIso.reverseGet(m), IntIso.get)
}

export const positive = gte(Zero)

export const increment = add(One)

export const decrement = sub(One)

export function parse(s: string): E.Either<InvalidInteger, Int> {
  try {
    const r = parseInt(s, 10)

    if (Number.isFinite(r)) {
      return pipe(
        Int.getOption(r),
        O.fold(() => E.left(new InvalidInteger()), E.right)
      )
    } else {
      return E.left(new InvalidInteger())
    }
  } catch {
    return E.left(new InvalidInteger())
  }
}
