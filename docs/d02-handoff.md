# D02 — реализация и проверки, 2026-11-19

Ревизия: 9cd2817fb9acc7f31b907859a0079d546c62cb9f/main. Пакет docs-only, без runtime/версий/тестов/данных. Реализация подключена; весь D02 НЕ закрыт. Продолжаем текущий диалог.

## Уже сделано

Пути fk070_packs в shell идут через commitData → packCommitter → writer: форма, editor-save, список/текстуры, import, clear, migrate и backupEntries. Прямой shell save — только настройки. Writer копирует/нормализует candidate, ждёт exclusive lock fk070_packs:write, сверяет raw/base внутри lock и пишет. Коды: PACK_SNAPSHOT_INVALID / PACK_LOCKS_UNAVAILABLE / PACK_WRITE_CONFLICT. Без Web Locks запись отклоняется. Старый код/обходные записи автоматически не защищены.

Persisted base, mutable live и draft различны. Live публикуется после записи; форма использует candidate/signal/rollback, editor-save проверяет токен перед markSaved. Recovery/CSS/cache key подключены: confirmed:true, busy/context guards, отказ при удалённом active до публикации. Нет записи при чтении, fillEdit/loadEditor/FKE.reset, auto-rebase или повторения старого candidate. Новый save ручной и строится из новых данных; предупреждение о замене чужих полей/текстур той же карточки включено. Не перенаправлять черновик в другой пак.

Recovery-коммиты: aba4c811 → 24d9b8a9 → 4331ac68 → 660abae4 → 9cd2817. [Прежняя история](https://github.com/arseninp/FoundryKin-Beta/blob/9cd2817fb9acc7f31b907859a0079d546c62cb9f/docs/d02-handoff.md) сохраняется; указания «writer не подключён»/«начать editor-save» устарели. Не делать повторный push.

## Матрица локальных прогонов

Результаты этого диалога на 9cd2817, Node v20.20.2; не новый запуск в docs-пакете. Постоянные тесты не менялись, код/тесты сверялись Git blob SHA.

| Набор | Итог | Границы |
| --- | --- | --- |
| tools/pack-writer.test.mjs | 8/8 | Storage/locks fixture |
| tools/backup-store.test.mjs | 11/11 | Storage fixture |
| tools/pack-shell-writer.test.mjs | 16/16 | Настоящие shell/writer/committer в VM; UI/FKE подставные. Recovery отсутствует в registry старого теста, он его не доказывает |
| tools/pack-form-save.test.mjs | 10/10 | Вся форма, fake DOM/FileReader/save |
| Временный import/clear/backup-host + backend | 14/14 | Archive reader/backup UI adapter подставные |
| Временный recovery wiring | 7/7 | Настоящий shell; recovery TEXT сокращён, две recovery-копии без SHA; прочие UI/FKE/DOM подставные |
| Временный список/текстуры | 18/18 групп | 8+10, оба модуля сверены SHA; DOM/reader/write callbacks подставные |
| Временный UI бэкапов | 17/17 групп | Модуль сверён SHA; DOM/images/store/commitRestore подставные |
| Временная цепочка бэкапов | 6/6 | Все шесть модулей UI/host/store/committer/writer/normalizer сверены SHA; DOM/images/storage/lock scheduler/routing callbacks подставные, не полный shell |

В последней цепочке: create/delete/restore ждут запись; конфликт со вторым настоящим writer над общей памятью сохраняет draft/чужие данные; явное чтение/новый retry, abort очереди и quota/retry проверены. Restore оставляет checkpoint byte-for-byte, другие паки/entries/настройки/палитры сохраняются. Recovery dialog не входит: reloadSaved вызывает тест.

Ранние 9/9 формы/editor-save имели упрощённые icon handlers/API редактора и не доказывают настоящие canvas/history; ранние 12/12 UI, 12/12 host, 8/8 callbacks также не расширяют матрицу. Исправлялись ошибки стендов: идентичная повторная чужая запись; DOMException.code=20 вместо AbortError в регистраторе. Повторные прогоны прошли без production-правок и ослабления утверждений. В охваченных сценариях production-дефектов не найдено, после 9cd2817 код по результатам прогонов не менялся.

Журналы/манифесты и временные тесты приложены к сообщениям, не в репозитории и не исполняются CI автоматически. Новая sandbox не обязана видеть старые файлы. Permanent tests — после согласования, существующие не ослаблять.

## Осталось и ручная приёмка

Не подтверждены: один запуск всей оболочки со всеми настоящими UI/FKE; native DOM/dialog/FileReader/JSZip/image decode/Web Locks/quota; две вкладки/Android; настоящие пиксели/Undo/Redo. Проверка migrate/FKAPP с L02 остаётся: shell-тест отмены использовал подставную preparePackMigration, не весь граф/D07. Свежий полный validate/CI и отдельно Pages SHA не получены; публичный checks API не открылся, это не красный и не зелёный статус.

На изолированном тестовом профиле/окружении, не очищая рабочие данные и не испытывая quota на паках владельца:
1. Создать P/Q, изменить текстуру P и создать бэкап; save/reopen/restore сохраняют снимок и Q.
2. Обе вкладки открыть до чужой записи. В B оставить поля/иконку P, в A изменить Q/backupEntries. Save B отказывает; «Оставить черновик» сохраняет ввод и не разрешает тихую перезапись.
3. В B подтвердить чтение: ввод остаётся, автоматической записи нет. Новый ручной save сохраняет чужие изменения Q/backupEntries.
4. Повторить с рисунком/Undo/Redo/dirty до retry; markSaved/успех только после записи. Проверить новый пак и удаление целевого P другой вкладкой: draft не попадает в Q.
5. Проверить отмену/Back/Escape/фокус/темы/мобильный layout. Обе вкладки должны загрузить новый код: cache key shell 0.9.35, общая версия 0.9.20; main не доказывает Pages. Фиксировать нативные результаты отдельно.

## Закрытие

Сверить исходные критерии D02 с матрицей и недостающей приёмкой: единая запись KEY, конкуренция, чужие данные/draft, отказ/retry/abort/quota/validation, все пути паков/текстур/import/clear/backups, соответствие успеха/markSaved записи. Не закрывать пробелы суммой повторных mocks.

После D02 — D05, затем D07/D08. Прежние контракты/43 ID/пустые превью сохраняются, общий UI-рефакторинг не начат. Исторический Validate №509/b2230c7 подтверждён, повторный скриншот не просить; preview-slice №516/d6aa681 оставался жёлтым, итог не подтверждён. Это не CI текущей ревизии.
