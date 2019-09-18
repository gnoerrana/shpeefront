/**
 * Asynchronously loads the component for NotFoundPage
 */
import loadable from 'loadable-components';

import LoaderInd from 'components/LoaderInd';

export default loadable(() => import('./index'), {
  LoadingComponent: LoaderInd,
});
