'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config'

export function Studio() {
  //  Supports the same values as `defineConfig` from `sanity`
  return <NextStudio config={config} />
}
