
DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD="ifnmg"
DB_NAME="sistema_ocorrencias"

BACKUP_DIR="/var/backups/sistemaocorrencias"

DATA=$(date +"%Y-%m-%d")

ARQUIVO_BACKUP="$BACKUP_DIR/backup_${DB_NAME}_$DATA.sql.gz"

mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $ARQUIVO_BACKUP

#find $BACKUP_DIR -name "backup_*.sql.gz" -type f -mtime +7 -exec rm -f {} \;
