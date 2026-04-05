import { Studio } from './Studio'

// Ensures the Studio route is statically generated
export const dynamic = 'force-static'

// Set the title of the Studio tab
export const metadata = {
  title: 'Sanity Studio - Budda\'s Catering',
}

export default function StudioPage() {
  return <Studio />
}
