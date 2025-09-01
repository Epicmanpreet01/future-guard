
const LoadingSpinner = ({ size, className }) => {
  return (
    <div className={className? `text-center loading loading-spinner loading-${size || 'lm'}` : className}></div>
  )
}

export default LoadingSpinner