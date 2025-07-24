import ReactPlayer from 'react-player';

const YoutubePlayer = ({ videoId }: Readonly<{ videoId: string }>) => {
  return (
    <div className='w-full h-full border-gray-300 rounded-lg flex'>
      {videoId && (<ReactPlayer
        controls={true}
        src={`https://www.youtube.com/watch?v=${videoId}`}
        width='100%'
        height='100%'
      />)}
    </div>
  );
};

export default YoutubePlayer;
