import { FC, useState, useMemo, useRef, useEffect } from 'react';
import { StyleWithAtRules } from 'style9';

import { CreateView } from '@toeverything/framework/virgo';
import CodeMirror from './CodeMirror';
import { styled } from '@toeverything/components/ui';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';

import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { xml } from '@codemirror/lang-xml';
import { sql, MySQL, PostgreSQL } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { rust } from '@codemirror/lang-rust';
import { cpp } from '@codemirror/lang-cpp';
import { lezer } from '@codemirror/lang-lezer';
import { php } from '@codemirror/lang-php';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { swift } from '@codemirror/legacy-modes/mode/swift';
import { tcl } from '@codemirror/legacy-modes/mode/tcl';
import { yaml } from '@codemirror/legacy-modes/mode/yaml';
import { vb } from '@codemirror/legacy-modes/mode/vb';
import { powerShell } from '@codemirror/legacy-modes/mode/powershell';
import { brainfuck } from '@codemirror/legacy-modes/mode/brainfuck';
import { stylus } from '@codemirror/legacy-modes/mode/stylus';
import { erlang } from '@codemirror/legacy-modes/mode/erlang';
import { nginx } from '@codemirror/legacy-modes/mode/nginx';
import { perl } from '@codemirror/legacy-modes/mode/perl';
import { pascal } from '@codemirror/legacy-modes/mode/pascal';
import { liveScript } from '@codemirror/legacy-modes/mode/livescript';
import { scheme } from '@codemirror/legacy-modes/mode/scheme';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { vbScript } from '@codemirror/legacy-modes/mode/vbscript';
import { clojure } from '@codemirror/legacy-modes/mode/clojure';
import { coffeeScript } from '@codemirror/legacy-modes/mode/coffeescript';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';
import { julia } from '@codemirror/legacy-modes/mode/julia';
import { r } from '@codemirror/legacy-modes/mode/r';
import { Extension } from '@codemirror/state';
import { Select } from '../../components/select';
import {
    useOnSelect,
    WrapperWithPendantAndDragDrop,
} from '@toeverything/components/editor-core';
interface CreateCodeView extends CreateView {
    style9?: StyleWithAtRules;
    containerClassName?: string;
}
const langs: Record<string, any> = {
    javascript,
    jsx: () => javascript({ jsx: true }),
    typescript: () => javascript({ typescript: true }),
    tsx: () => javascript({ jsx: true, typescript: true }),
    json,
    html,
    css,
    python,
    markdown,
    xml,
    sql,
    mysql: () => sql({ dialect: MySQL }),
    pgsql: () => sql({ dialect: PostgreSQL }),
    java,
    rust,
    cpp,
    lezer,
    php,
    go: () => StreamLanguage.define(go),
    shell: () => StreamLanguage.define(shell),
    lua: () => StreamLanguage.define(lua),
    swift: () => StreamLanguage.define(swift),
    tcl: () => StreamLanguage.define(tcl),
    yaml: () => StreamLanguage.define(yaml),
    vb: () => StreamLanguage.define(vb),
    powershell: () => StreamLanguage.define(powerShell),
    brainfuck: () => StreamLanguage.define(brainfuck),
    stylus: () => StreamLanguage.define(stylus),
    erlang: () => StreamLanguage.define(erlang),
    nginx: () => StreamLanguage.define(nginx),
    perl: () => StreamLanguage.define(perl),
    ruby: () => StreamLanguage.define(ruby),
    pascal: () => StreamLanguage.define(pascal),
    livescript: () => StreamLanguage.define(liveScript),
    scheme: () => StreamLanguage.define(scheme),
    toml: () => StreamLanguage.define(toml),
    vbscript: () => StreamLanguage.define(vbScript),
    clojure: () => StreamLanguage.define(clojure),
    coffeescript: () => StreamLanguage.define(coffeeScript),
    julia: () => StreamLanguage.define(julia),
    dockerfile: () => StreamLanguage.define(dockerFile),
    r: () => StreamLanguage.define(r),
    // clike: () => StreamLanguage.define(clike),
    // clike: () => clike({ }),
};

const CodeBlock = styled('div')(({ theme }) => ({
    backgroundColor: '#f8f9fa',
    border: '1px solid #e0e0e0',
    '&:hover': {
        '.operation': {
            display: 'flex',
        },
    },
    '.operation': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        padding: '0 8px 0px',
    },
    '.delete-block': {
        padding: '10px 4px 10px 10px',
    },
    '.cm-focused': {
        outline: 'none !important',
    },
    '.select': {
        marginTop: '10px',
        select: {
            border: 'none',
            outline: 'none',
            height: '22px',
            lineHeight: theme.affine.typography.body1.lineHeight,
            paddingLeft: '10px',
            maxHeight: '400px',
            background: '#f1f1f1',
            borderRadius: '6px',
        },
    },
}));
export const CodeView: FC<CreateCodeView> = ({ block, editor }) => {
    const init_value: string = block.getProperty('text')?.value?.[0]?.text;
    const lang_type: string = block.getProperty('lang')?.value?.[0]?.text;
    const [mode, setMode] = useState('javascript');
    const [extensions, setExtensions] = useState<Extension[]>();
    const codeMirror = useRef();
    useOnSelect(block.id, (is_select: boolean) => {
        if (codeMirror.current) {
            //@ts-ignore
            codeMirror?.current?.view?.focus();
        }
    });
    const onChange = (value: any, codeEditor: any) => {
        console.log(value);
        block.setProperty('text', {
            value: [{ text: value }],
        });
    };
    useEffect(() => {
        handleLangChange(lang_type ? lang_type : 'javascript');
    }, []);
    function handleLangChange(lang: string) {
        block.setProperty('lang', lang);
        setMode(lang);
        setExtensions([langs[lang]()]);
    }
    const handle_remove_block = () => {
        block.remove();
    };
    const handleKeyArrowDown = () => {
        editor.selectionManager.activeNextNode(block.id, 'start');
    };
    const handleKeyArrowUp = () => {
        editor.selectionManager.activePreviousNode(block.id, 'start');
    };
    return (
        <WrapperWithPendantAndDragDrop editor={editor} block={block}>
            <CodeBlock
                onKeyDown={e => {
                    e.stopPropagation();
                }}
            >
                <div className="operation">
                    <div className="select">
                        <Select
                            label="Lang"
                            options={Object.keys(langs)}
                            value={mode}
                            onChange={evn => handleLangChange(evn.target.value)}
                        />
                    </div>
                    <div>
                        <div
                            className="delete-block"
                            onClick={handle_remove_block}
                        >
                            <DeleteSweepOutlinedIcon
                                className="delete-icon"
                                fontSize="small"
                                sx={{
                                    color: 'rgba(0,0,0,.5)',
                                    cursor: 'pointer',
                                    '&:hover': { color: 'rgba(0,0,0,.9)' },
                                }}
                            />
                        </div>
                    </div>
                </div>

                <CodeMirror
                    ref={codeMirror}
                    value={init_value}
                    height={'auto'}
                    extensions={extensions}
                    onChange={onChange}
                    handleKeyArrowDown={handleKeyArrowDown}
                    handleKeyArrowUp={handleKeyArrowUp}
                />
            </CodeBlock>
        </WrapperWithPendantAndDragDrop>
    );
};