import { FC, PropsWithChildren } from 'react';

type TrackProps = {
  gap?: number;
  align?: 'left' | 'center' | 'right';
  justify?: 'start' | 'between' | 'center' | 'around' | 'end';
  direction?: 'horizontal' | 'vertical';
  isMultiline?: boolean;
}

const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

const justifyMap = {
  start: 'flex-start',
  between: 'space-between',
  center: 'center',
  around: 'space-around',
  end: 'flex-end',
};

const Track: FC<PropsWithChildren<TrackProps>> = (
  {
    gap = 0,
    align = 'center',
    justify = 'start',
    direction = 'horizontal',
    isMultiline = false,
    children,
  },
) => {
  return (
    <div
      className='track'
      style={{
        display: 'flex',
        gap,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flexWrap: isMultiline ? 'wrap' : undefined,
      }}
    >
      {children}
    </div>
  );
};

export default Track;