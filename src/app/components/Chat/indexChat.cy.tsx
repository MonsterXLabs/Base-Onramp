import React, { useEffect } from 'react';
import Chat from './index';
import { GlobalProvider } from '../Context/GlobalContext';
import { ThemeProvider } from '../provider/theme-provider';
import { ThirdwebProvider } from 'thirdweb/react';
import AppHeader from '../Header/AppHeader';
import { useRecoilState } from 'recoil';
import { globalUserState } from '@/hooks/recoil-state';
import { Address, checksumAddress } from 'thirdweb/utils';
import { authenticationServices } from '@/services/legacy/supplier';
import { createCookie } from '@/lib/cookie';

const MockUserLogin: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useRecoilState(globalUserState);
  const fetchUser = async () => {
    try {
      const address = checksumAddress(
        '0x76544c2db6136165736dBC189F8d5A1602480d0c',
      ) as Address;
      const { data } = await authenticationServices.connectWallet({
        wallet: address,
      });
      const connectedUser = data.user;
      const connectedToken = data.token;
      createCookie('user', JSON.stringify(connectedUser));
      createCookie('token', connectedToken);
      Cypress.log(connectedUser);
      setUser(connectedUser);
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return children;
};

export const MountWithProviders: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <html lang="en">
      <body className={`manrope-font`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <ThirdwebProvider>
            <GlobalProvider>
              <div className="w-full lg:w-[100%] flex flex-col gap-y-2 px-2">
                <AppHeader />
                <MockUserLogin>{children}</MockUserLogin>
              </div>
            </GlobalProvider>
          </ThirdwebProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};
describe('<Chat />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <MountWithProviders>
        {/* <Chat chatUrl="" isOpen={true} /> */}
      </MountWithProviders>,
    );
  });
});
