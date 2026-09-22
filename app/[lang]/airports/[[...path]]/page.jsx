// Livdar Atlas route for /{lang}/airports/. See components/atlas/atlasRoute.jsx.
import '../../../atlas.css';
import { makeAtlasRoute } from '../../../../components/atlas/atlasRoute.jsx';

const route = makeAtlasRoute('airports');

// Published pages are generated at build time (capped); approved pages on a
// preview, and anything past the cap, render on request and are cached.
export const dynamicParams = true;
export const revalidate = 86400;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
