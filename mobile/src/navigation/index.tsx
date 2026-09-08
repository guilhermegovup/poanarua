import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '~/screens/About';
import CallShowRoutesScreen from '~/screens/CallShowRoutes';
import CategoriesByRegisterScreen from '~/screens/CategoriesByRegister';
import CategoryListScreen from '~/screens/CategoryList';
import ContactsByRegisterScreen from '~/screens/ContactsByRegister';
import DescriptionEventScreen from '~/screens/DescriptionEvent';
import EditScreen from '~/screens/Edit';
import FavoritesEventsScreen from '~/screens/FavoritesEvents';
import InAppMessageScreen from '~/screens/InAppMessage';
import LoginScreen from '~/screens/Login';
import LoginWithEmailScreen from '~/screens/LoginWithEmail';
import MapsScreen from '~/screens/Maps';
import MyEventsScreen from '~/screens/MyEvents';
import OpenLinksScreen from '~/screens/OpenLinks';
import PhotosScreen from '~/screens/Photos';
import RecoverPasswordScreen from '~/screens/RecoverPassword';
import RegisterEventScreen from '~/screens/RegisterEvent';
import RegisterUserScreen from '~/screens/RegisterUser';
import SearchScreen from '~/screens/Search';
import SendOpinionScreen from '~/screens/SendOpinion';
import SplashScreen from '~/screens/Splash';
import UpdateAppScreen from '~/screens/UpdateApp';

import TabNavigator from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * O app original combinava um SwitchNavigator (Splash → Login → App) com dois
 * stacks e um stack modal. Aqui tudo vive num stack só: a Splash faz `replace`
 * para o destino certo e as telas modais usam `presentation: 'modal'`.
 */
export function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />

        <Stack.Group screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UpdateApp" component={UpdateAppScreen} />
        </Stack.Group>

        <Stack.Screen name="LoginWithEmail" component={LoginWithEmailScreen} />
        <Stack.Screen name="RegisterUser" component={RegisterUserScreen} />
        <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />

        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ gestureEnabled: false }}
        />

        <Stack.Screen name="CategoryList" component={CategoryListScreen} />
        <Stack.Screen name="DescriptionEvent" component={DescriptionEventScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
        <Stack.Screen name="FavoritesEvents" component={FavoritesEventsScreen} />
        <Stack.Screen name="MyEvents" component={MyEventsScreen} />
        <Stack.Screen name="RegisterEvent" component={RegisterEventScreen} />
        <Stack.Screen name="OpenLinks" component={OpenLinksScreen} />

        <Stack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SendOpinion" component={SendOpinionScreen} />
          <Stack.Screen name="Maps" component={MapsScreen} />
          <Stack.Screen name="CategoriesByRegister" component={CategoriesByRegisterScreen} />
          <Stack.Screen name="ContactsByRegister" component={ContactsByRegisterScreen} />
          <Stack.Screen name="CallShowRoutes" component={CallShowRoutesScreen} />
          <Stack.Screen name="Photos" component={PhotosScreen} />
        </Stack.Group>

        <Stack.Screen
          name="InAppMessage"
          component={InAppMessageScreen}
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;
