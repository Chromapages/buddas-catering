import { type SchemaTypeDefinition } from 'sanity'
import { cateringPackage } from './catering-package'
import { menuItem } from './menu-item'
import { siteSettings } from './siteSettings'
import { testimonial } from './testimonial'
import { landingPage } from './landingPage'
import { category } from './category'
import { modifier } from './modifier'
import communicationTemplate from './communication-template'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cateringPackage, menuItem, siteSettings, testimonial, landingPage, category, modifier, communicationTemplate],
}
