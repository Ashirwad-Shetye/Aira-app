 "use client";
import React, { useEffect, useState } from 'react'

type Props = {
    userName: string
    align: "left" | "right"
}

const Greetings = ({userName, align}: Props) => {
  const [greeting, setGreeting] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    const hours = now.getHours();
    let greet = 'Hello';
    if (hours < 12) {
      greet = 'Good morning';
    } else if (hours < 18) {
      greet = 'Good afternoon';
    } else if (hours < 22) {
      greet = 'Good evening';
    } else {
      greet = 'Good night';
    }
    setGreeting(greet);
    setFormattedDate(
      now.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    );
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <h1 className={`text-${align}   text-2xl`}>
        {greeting}, {userName}
      </h1>
      <p className='text-xl text-gray-500'>{formattedDate}</p>
    </div>
  );
}

export default Greetings