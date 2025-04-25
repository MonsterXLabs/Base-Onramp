import { useState, useEffect } from 'react';
import moment from 'moment';

const calculateTimeRemaining = (
  bidTime: string,
  durationInSeconds: number,
): {
  secondsMode: boolean;
  result: string;
} => {
  const bidStartTime = moment(bidTime);
  const bidEndTime = bidStartTime.add(durationInSeconds, 'seconds');
  const now = moment();
  const timeDifference = moment.duration(bidEndTime.diff(now));

  let secondsMode = false;
  let result = '';

  if (timeDifference.asSeconds() <= 0) {
    result = 'Auction ended';
    return {
      secondsMode,
      result,
    };
  }

  const days = Math.floor(timeDifference.asDays());
  const hours = Math.floor(timeDifference.hours());
  const minutes = timeDifference.minutes();
  const seconds = timeDifference.seconds();

  if (days > 0) {
    result = `in ${days} days ${hours} hours ${minutes} mins`;
  } else if (hours > 0) {
    result = `in ${hours} hours ${minutes} mins`;
  } else if (minutes > 0) {
    result = `in ${minutes} mins`;
  } else {
    secondsMode = true;
    result = `in ${seconds} seconds`;
  }

  return {
    secondsMode,
    result,
  };
};

const BidTimer = ({
  bidTime,
  durationInSeconds,
}: {
  bidTime: string;
  durationInSeconds: number;
}) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    secondsMode: boolean;
    result: string;
  }>(calculateTimeRemaining(bidTime, durationInSeconds));

  useEffect(() => {
    const updateTimer = () => {
      setTimeRemaining(calculateTimeRemaining(bidTime, durationInSeconds));
      setTimeout(updateTimer, timeRemaining.secondsMode ? 1000 : 60 * 1000); // Update every second
    };

    const timeout = setTimeout(
      updateTimer,
      timeRemaining.secondsMode ? 1000 : 60 * 1000,
    );

    return () => clearTimeout(timeout);
  }, [bidTime, durationInSeconds]);

  return (
    <div>
      <p>{timeRemaining.result}</p>
    </div>
  );
};

export default BidTimer;
