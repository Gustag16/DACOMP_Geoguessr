import React, { type ReactNode } from 'react'
import type { PlayerAvatarProps } from './PlayerAvatar' // para keyof


interface PlayerEditProps {
  ownName: string;
  children: ReactNode;
  onStyleChange: (categoria: keyof PlayerAvatarProps, direcao: 'next' | 'prev') => void;
}

export default function PlayerEdit({ ownName, children, onStyleChange }: PlayerEditProps) {
  return (
    <div className='flex flex-col items-center gap-2'>
        {children}
        
        <span>{ownName}</span>

        <div className='seletor-container'>      
            <div className='linha-seletor'>
                <button onClick={() => onStyleChange('head', 'prev')}>&lt;</button> 
                <span> Head </span> 
                <button onClick={() => onStyleChange('head', 'next')}>&gt;</button>
            </div>
            <div className='linha-seletor'>
                <button onClick={() => onStyleChange('face', 'prev')}>&lt;</button> 
                <span> Face </span> 
                <button onClick={() => onStyleChange('face', 'next')}>&gt;</button>
            </div>
            <div className='linha-seletor'>
                <button onClick={() => onStyleChange('acc', 'prev')}>&lt;</button> 
                <span> Acc </span> 
                <button onClick={() => onStyleChange('acc', 'next')}>&gt;</button>
            </div>
            <div className='linha-seletor'>
                <button onClick={() => onStyleChange('color', 'prev')}>&lt;</button> 
                <span> Color </span> 
                <button onClick={() => onStyleChange('color', 'next')}>&gt;</button>
            </div>
        </div>  
    </div>
  )
}