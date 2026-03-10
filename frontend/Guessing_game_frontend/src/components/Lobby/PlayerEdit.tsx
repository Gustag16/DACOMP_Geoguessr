import React, { type ReactNode } from 'react'
import type { PlayerAvatarProps } from './PlayerAvatar'


interface PlayerEditProps {
  ownName: string;
  children: ReactNode;
  onStyleChange: (categoria: 'head' | 'face' | 'acc' | 'color', direcao: 'next' | 'prev') => void;
  onNameChange: (newName: string) => void;
}

export default function PlayerEdit({ ownName, children, onStyleChange, onNameChange }: PlayerEditProps) {
  return (
    <div className="w-72 h-48 shadow-[0px_4px_4px_0px_rgba(184,184,184,0.25)] outline outline-[10px] outline-white justify-end flex" >      
      
      <span className='mt-11'>{children}</span>
      
      <div className='ml-3 mt-3 mr-3'>
        <input 
            type="text"
            value={ownName}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={12} // Limite de caracteres para não quebrar o layout
            placeholder='name'
            className="text-center text-white text-1xl font-normal font-['Audiowide'] bg-transparent 
            border-b-2 border-transparent border-white/50 placeholder:text-white/75
            focus:border-white focus:outline-none focus:placeholder-transparent w-full pb-1 transition-colors"
        />

        <div className="w-full mt-4 flex justify-center items-center gap-4 text-white text-base font-normal font-['Silkscreen']">
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('head', 'prev')}>&lt;</button> 
            <span className="w-16 text-center">Head</span> 
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('head', 'next')}>&gt;</button>
        </div>
        
        <div className="w-full mt-1 flex justify-center items-center gap-4 text-white text-base font-normal font-['Silkscreen']">
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('face', 'prev')}>&lt;</button> 
            <span className="w-16 text-center">Face</span> 
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('face', 'next')}>&gt;</button>
        </div>
        
        <div className="w-full mt-1 flex justify-center items-center gap-4 text-white text-base font-normal font-['Silkscreen']">
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('acc', 'prev')}>&lt;</button> 
            <span className="w-16 text-center">Acc</span> 
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('acc', 'next')}>&gt;</button>
        </div>
        
        <div className="w-full mt-1 flex justify-center items-center gap-4 text-white text-base font-normal font-['Silkscreen']">
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('color', 'prev')}>&lt;</button> 
            <span className="w-16 text-center">Color</span> 
            <button className='hover:cursor-pointer px-2 hover:text-gray-300' onClick={() => onStyleChange('color', 'next')}>&gt;</button>
        </div>
      </div>
    </div>
  )
}