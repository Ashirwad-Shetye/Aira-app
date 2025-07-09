import React from 'react'

type Props = {
    userName: string
    align: "left" | "right"
}

const Greetings = ({userName, align}: Props) => {
  const now = new Date();
  const hours = now.getHours();

  let greeting = 'Hello';
  if (hours < 12) {
    greeting = 'Good morning';
  } else if (hours < 18) {
    greeting = 'Good afternoon';
  } else {
    greeting = 'Good evening';
  }

  const formattedDate = now.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
		<div>
			<h1 className={`text-${align} font-pt-sans text-2xl`}>
				{greeting}, {userName}
			</h1>
			<p className='text-xl text-gray-500'>{formattedDate}</p>
		</div>
	);
}

export default Greetings