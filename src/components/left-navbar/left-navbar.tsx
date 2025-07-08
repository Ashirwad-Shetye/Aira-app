import React from 'react'

type Props = {}

const LeftNavbar = (props: Props) => {
  return (
      <div className='border rounded flex flex-col relative items-center justify-between'>
          <div>
              <div>
                  dashboard
              </div>
          </div>
          <div>
              <div>
                  settings
              </div>
          </div>
    </div>
  )
}

export default LeftNavbar