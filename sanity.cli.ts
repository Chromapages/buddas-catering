/**
 * This configuration file lets you run Sanity CLI with 'sanity-next' commands.
 * Learn more: https://www.sanity.io/docs/cli
 */

import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from './src/sanity/env'

export default defineCliConfig({
  api: { projectId, dataset }
})
