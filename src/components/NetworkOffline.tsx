import useNetworkStatus from '@/utils/hooks/useNetworkStatus';
const NetworkOffline: React.FC = () => {
  // const { isOnline } = useNetworkStatus();
  return (
    <>
      {/* {!isOnline && ( */}
      <div className="network-offline-message">
        <p>You are offline. Please check your internet connection.</p>
      </div>
      {/* )} */}
    </>
  );
};

export default NetworkOffline;
