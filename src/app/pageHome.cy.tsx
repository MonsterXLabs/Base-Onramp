import { MountWithProviders } from './components/Chat/indexChat.cy';
import Home from './page';

describe('<Home />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <MountWithProviders>
        <Home />
      </MountWithProviders>,
    );
  });
});
