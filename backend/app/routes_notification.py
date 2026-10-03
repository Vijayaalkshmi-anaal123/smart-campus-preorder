from flask import Blueprint, jsonify
from .models import db, Notification
from .auth import token_required

notification_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notification_bp.route('', methods=['GET'])
@token_required
def get_user_notifications(current_user):
    notifications = Notification.query.filter_by(user_id=current_user.id)\
        .order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = Notification.query.filter_by(user_id=current_user.id, is_read=False).count()

    return jsonify({
        'success': True,
        'unread_count': unread_count,
        'notifications': [n.to_dict() for n in notifications]
    }), 200

@notification_bp.route('/<int:notif_id>/read', methods=['PUT'])
@token_required
def mark_notification_read(current_user, notif_id):
    notif = Notification.query.filter_by(id=notif_id, user_id=current_user.id).first()
    if not notif:
        return jsonify({'success': False, 'message': 'Notification not found'}), 404

    notif.is_read = True
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Notification marked as read',
        'notification': notif.to_dict()
    }), 200

@notification_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read(current_user):
    Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'All notifications marked as read'
    }), 200
