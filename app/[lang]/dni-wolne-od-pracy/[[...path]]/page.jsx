// Livdar Atlas data route for /{lang}/dni-wolne-od-pracy/. See components/atlas/atlasPageRoute.jsx.
import '../../../atlas.css';
import { makeAtlasPageRoute } from '../../../../components/atlas/atlasPageRoute.jsx';

const route = makeAtlasPageRoute('dni-wolne-od-pracy');

// Every page served here is in the cohort manifest and passed cohort QA, so
// the whole set is generated at build time and revalidated daily.
export const dynamicParams = false;
export const revalidate = 86400;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
