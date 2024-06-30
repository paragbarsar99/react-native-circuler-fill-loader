import {lightTheme} from 'lib/UniStyles';
import * as React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedProps,
  Easing,
  useSharedValue,
  withTiming,
  useDerivedValue,
  withRepeat,
} from 'react-native-reanimated';
import Svg, {G, Circle} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TCircle {
  percentage?: number;
  radius?: number;
  strokeWidth?: number;
  duration?: number;
  colorInner?: string;
  colorOutter?: string;
  delay?: number;
  textColor?: string;
  max?: number;
  onFinish: (timer: number) => void;
  loop?: boolean;
}

const UploadProgressbar: React.FC<TCircle> = ({
  percentage = 10,
  radius = 40,
  strokeWidth = 10,
  duration = 300,
  colorInner = lightTheme.colors.green_600,
  colorOutter = lightTheme.colors.green_400,
  max = 100,
  loop = false,
  onFinish,
}) => {
  const animated = useSharedValue(0);
  const circumference = 2 * Math.PI * (radius / 2);
  const halfCircle = radius + strokeWidth;

  const percentageRef = useSharedValue(0);
  const newAnimatedValue = useSharedValue(percentage);
  const [_, setState] = React.useState(0);

  const onFinishAnimation = React.useCallback(
    (toValue: number) => {
      setState(prev => {
        percentageRef.value = prev + toValue;
        return prev + toValue;
      });
      onFinish(toValue);
    },
    [percentageRef, onFinish],
  );

  const animation = React.useCallback(
    (toValue: number) => {
      const composeValue = percentageRef.value + newAnimatedValue.value;
      if (loop) {
        animated.value = withRepeat(
          withTiming(
            composeValue,
            {
              easing: Easing.linear,
              duration: duration,
            },

            finished => {
              if (finished) {
                runOnJS(onFinishAnimation)(toValue);
              }
            },
          ),
          -1,
        );
      } else {
        animated.value = withTiming(
          composeValue,
          {
            easing: Easing.linear,
            duration: duration,
          },

          finished => {
            if (finished) {
              runOnJS(onFinishAnimation)(toValue);
            }
          },
        );
      }
    },
    [
      percentageRef.value,
      newAnimatedValue.value,
      animated,
      duration,
      onFinishAnimation,
      loop,
    ],
  );

  React.useEffect(() => {
    animation(percentage);
  }, [animation, percentage]);

  const getStrockWidth = (width: number) => {
    console.log(width);
  };

  const strokeDashoffset = useDerivedValue(() => {
    const maxPerc = (100 * animated.value) / max;
    return circumference - (circumference * maxPerc) / 100;
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  }, [max, animated, circumference]);

  return (
    <View style={{width: radius * 2, height: radius * 2}}>
      <Svg
        height={radius * 2}
        width={radius * 2}
        style={styles.svg}
        viewBox={`0 0 ${halfCircle * 2} ${halfCircle * 2}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          <Circle
            cx="50%"
            cy="50%"
            r={radius}
            fill={`${colorOutter}`}
            stroke={'transparent'}
            strokeWidth={0}
            strokeLinecap="round"
          />
          <AnimatedCircle
            animatedProps={animatedProps}
            cx="50%"
            cy="50%"
            r={radius / 2}
            fill={'transparent'}
            stroke={`${colorInner}`}
            strokeWidth={radius}
            strokeLinejoin="round"
            strokeOpacity="1"
            strokeDashoffset={circumference}
            strokeDasharray={circumference}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  svg: {overflow: 'hidden'},
  text: {fontWeight: '900', textAlign: 'center'},
});

export default UploadProgressbar;
