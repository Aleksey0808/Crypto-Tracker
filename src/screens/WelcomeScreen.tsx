import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  Image,
  TouchableOpacity 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type WelcomeNavProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const WelcomeScreen = ({ navigation }: { navigation: WelcomeNavProp }) => {
  return (
    <LinearGradient
      colors={['#03b0ea', '#03b0ea', '#03b0ea']}
      style={{flex: 1}}
    >
      <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.logo} source={require('../../assets/image.png')} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Crypto Tracker</Text>
        <Text style={styles.description}>
         Track cryptocurrency prices with ease. Get real-time market updates, search for any coin instantly, view detailed insights, and build your personal favorites list to keep up with the assets that matter most to you.
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>

      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
  },
  logo: {

  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontWeight: 700,
    fontSize: 26,
    color: '#ead409ff',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#f92020',
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 18,
    marginBottom: 60,
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default WelcomeScreen;