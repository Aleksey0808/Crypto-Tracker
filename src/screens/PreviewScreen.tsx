
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as Progress from 'react-native-progress';
import LinearGradient from 'react-native-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type PreviewNavProp = StackNavigationProp<RootStackParamList, 'Preview'>;

const PreviewScreen = ({ navigation }: { navigation: PreviewNavProp }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval); 
          return 1;
        }
        return prev + 0.1; 
      });
    }, 550);

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Welcome');
    }, 6000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#03b0ea', '#03b0ea', '#03b0ea']}
      style={styles.container}
    >
      <Text style={styles.title}>Loading...</Text>
      <View style={styles.progressContainer}>
        <Progress.Bar
          progress={progress} 
          width={150} 
          height={15}
          color="#f92020" 
          unfilledColor="#fff" 
          borderWidth={1} 
          borderColor='#fff'
          borderRadius={20} 
          animated={true} 
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 80, 
    marginRight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff', 
    marginTop: 100,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default PreviewScreen;
