export const getSenderColor = (sender: string): string => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', 
    '#1abc9c', '#e67e22', '#34495e', '#d35400', '#c0392b'
  ];
  
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = sender.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false 
  });
};
