import CodeBox from '../components/Lobby/CodeBox'
import PlayerCard from '../components/Lobby/PlayerCard'
import PlayerEdit from '../components/Lobby/PlayerEdit'
import PlayerAvatar from '../components/Lobby/PlayerAvatar'
import { useState } from 'react'
import type { PlayerAvatarProps } from '../components/Lobby/PlayerAvatar' // utiliza as props do avatar como o tipo
import { facesList, headsList, accsList, colorsList } from '../components/Lobby/PlayerAvatar'

export default function Lobby() {
    // variaveis para teste
    const code = "ABC4"
    const numPlayers = 15
    const ownName = "Gustavo"

    // lista para teste
    const outrosJogadores = [
        { id: 1, name: "Possebon", head: "redonda", face: "triste", acc: "oculos", color: "verde" },
        { id: 2, name: "Nicole", head: "redonda", face: "medo", acc: "nenhum", color: "vermelho" },
        { id: 3, name: "Maykon", head: "quadrada", face: "feliz", acc: "chapeu", color: "azul" }    
    ];

    // criando o estado como um objeto e tipando ele
    const [avatarConfig, setAvatarConfig] = useState<PlayerAvatarProps>({
        head: 'redonda',
        face: 'feliz',
        acc: 'chapeu',
        color: 'azul'
    })

    function handleStyleChange(categoria: keyof PlayerAvatarProps, direcao: 'next' | 'prev') {
        // decidir a lista correta de acordo com o parametro
        let listaAtual: string[] = [];
        if (categoria === 'face') listaAtual = facesList;
        if (categoria === 'head') listaAtual = headsList;
        if (categoria === 'acc') listaAtual = accsList;
        if (categoria === 'color') listaAtual = colorsList;

        const valorAtual = avatarConfig[categoria];
        const indexAtual = listaAtual.indexOf(valorAtual);
        let novoIndex = 0; 
        // calcular o prox index
        if (direcao === 'next') {
            novoIndex = indexAtual + 1;
            // se passar do limite, volta pro zero (dá a volta)
            if (novoIndex >= listaAtual.length) {
                novoIndex = 0;
            }
        } else if (direcao === 'prev') {
            novoIndex = indexAtual - 1;
            // se for menor que zero, vai pro último item da lista (dá a volta)
            if (novoIndex < 0) {
                novoIndex = listaAtual.length - 1;
            }
        }

        // atualiza o estado do React com o novo valor
        setAvatarConfig({
            ...avatarConfig, // mantém as outras configurações iguais
            [categoria]: listaAtual[novoIndex] // atualiza só a categoria que mudou
        });

    }

    return (
        <div>
            <CodeBox code={code} numPlayers={numPlayers} />
            
            <PlayerEdit ownName={ownName} onStyleChange={handleStyleChange}>
                <PlayerAvatar 
                    head={avatarConfig.head} 
                    face={avatarConfig.face} 
                    acc={avatarConfig.acc} 
                    color={avatarConfig.color} 
                />
            </PlayerEdit>

            {/*no futuro, 'outrosJogadores' vai ser puxado do backend*/}
            <div className="player-list">
                {outrosJogadores.map((jogador) => (
                    <PlayerCard key={jogador.id} name={jogador.name}>
                        <PlayerAvatar 
                            head={jogador.head} 
                            face={jogador.face} 
                            acc={jogador.acc} 
                            color={jogador.color} 
                        />
                    </PlayerCard>
                ))}
            </div>
        </div>
    )
}